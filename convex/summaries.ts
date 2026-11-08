import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type ActionCtx,
} from "./_generated/server";
import { getSummarizingGPTModel } from "./lib/env";
import { apiSafeName, simpleTextResponse } from "./lib/openAiUtils";

/*
 * Each summary covers a room's history through one message, and is built from
 * the previous summary plus that message. Summaries are built eagerly as
 * messages complete, so they're usually ready when the GM needs one.
 */

/** Most summaries to build in one run, to stay well inside the action time limit. */
const MAX_PER_RUN = 100;

/** The latest summary at or before `upTo`, and the complete messages after it. */
export const pending = internalQuery({
  args: { roomId: v.id("rooms"), upTo: v.optional(v.number()) },
  handler: async (ctx, { roomId, upTo }) => {
    const latest = await ctx.db
      .query("summaries")
      .withIndex("by_room_index", (q) => {
        const inRoom = q.eq("roomId", roomId);
        return upTo === undefined ? inRoom : inRoom.lte("messageIndex", upTo);
      })
      .order("desc")
      .first();
    const after = latest?.messageIndex ?? -1;

    const candidates = await ctx.db
      .query("messages")
      .withIndex("by_room_index", (q) => {
        const unsummarized = q.eq("roomId", roomId).gt("index", after);
        return upTo === undefined
          ? unsummarized
          : unsummarized.lte("index", upTo);
      })
      .take(MAX_PER_RUN);

    // The chain has to be contiguous, so stop at the first unfinished message.
    const messages = [];
    for (const message of candidates) {
      if (!message.complete) {
        break;
      }
      messages.push({
        index: message.index,
        name: message.name,
        content: message.content,
      });
    }

    return { summary: latest?.summary ?? "", messages };
  },
});

export const save = internalMutation({
  args: {
    roomId: v.id("rooms"),
    messageIndex: v.number(),
    summary: v.string(),
  },
  handler: async (ctx, { roomId, messageIndex, summary }) => {
    const existing = await ctx.db
      .query("summaries")
      .withIndex("by_room_index", (q) =>
        q.eq("roomId", roomId).eq("messageIndex", messageIndex)
      )
      .first();
    if (!existing) {
      await ctx.db.insert("summaries", { roomId, messageIndex, summary });
    }
  },
});

export const catchUp = internalAction({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    await buildSummaries(ctx, roomId, undefined);
  },
});

/**
 * Returns the summary of a room through message `index`, building any
 * missing summaries first.
 */
export async function getSummaryThrough(
  ctx: ActionCtx,
  roomId: Id<"rooms">,
  index: number
): Promise<string> {
  return await buildSummaries(ctx, roomId, index);
}

async function buildSummaries(
  ctx: ActionCtx,
  roomId: Id<"rooms">,
  upTo: number | undefined
): Promise<string> {
  const { summary, messages } = await ctx.runQuery(internal.summaries.pending, {
    roomId,
    upTo,
  });

  let current = summary;
  for (const message of messages) {
    current = await summarize(current, message);
    await ctx.runMutation(internal.summaries.save, {
      roomId,
      messageIndex: message.index,
      summary: current,
    });
  }
  return current;
}

async function summarize(
  oldSummary: string,
  message: { name?: string; content: string }
): Promise<string> {
  const incomingText = `[${apiSafeName(message.name)}] ${message.content}`;
  const lines = [
    `You are an AI that progressively summarizes a tabletop RPG game as it is played.`,
    `You will be given the summary of the conversation so far, as well as the most recent message in the conversation.`,
    `Please respond with a new summary of the whole conversation including the latest message.`,
    `Respond only with your new summary.`,
    `Your response MUST be less than 1000 words.`,
    ``,
    `Summary so far \`\`\`${oldSummary}\`\`\``,
    ``,
    `Latest message \`\`\`${incomingText}\`\`\``,
  ];

  return await simpleTextResponse(
    [{ role: "system", content: lines.join("\n") }],
    {
      model: getSummarizingGPTModel(),
      temperature: 0.0, // So we get consistent results. Summaries don't need to be creative.
    }
  );
}
