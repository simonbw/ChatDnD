import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { ActionParser, type GameMasterAction } from "./lib/actionParser";
import { drawStoryCharacter, drawStoryScene } from "./lib/images";
import { giveItem, removeItem } from "./lib/inventory";
import { LlmRefusalError, streamText, type LlmMessage } from "./lib/llm";
import { makeInitialSystemMessage } from "./lib/prompts/initialPrompts";
import {
  getRoomOrThrow,
  getRoomPlayers,
  startGmResponse,
  toPlayer,
} from "./lib/roomHelpers";
import { messageActionValidator } from "./lib/validators";
import { getSummaryThrough } from "./summaries";

/** Recent messages are sent verbatim up to about this many characters; older ones are summarized. */
const LAST_CHATS_MAX_CHARACTERS = 800;

/** How often streamed text is written to the database (and so pushed to players). */
const FLUSH_INTERVAL_MS = 200;

const FAILED_RESPONSE_TEXT =
  "*The Game Master seems lost in thought. Say something to try again.*";

type HistoryMessage = Pick<
  Doc<"messages">,
  "index" | "role" | "name" | "content"
>;

/** Everything needed to build the prompt for a response. */
export const context = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error(`Message not found: ${messageId}`);
    }
    const room = await getRoomOrThrow(ctx, message.roomId);
    const players = await getRoomPlayers(ctx, room._id);
    const history = await ctx.db
      .query("messages")
      .withIndex("by_room_index", (q) =>
        q.eq("roomId", room._id).lt("index", message.index)
      )
      .collect();
    return {
      roomName: room.name,
      players: players.map(toPlayer),
      history: history.map(
        (m): HistoryMessage => ({
          index: m.index,
          role: m.role,
          name: m.name,
          content: m.content,
        })
      ),
    };
  },
});

/** Streams the GM's response into the placeholder message `messageId`. */
export const respond = internalAction({
  args: { roomId: v.id("rooms"), messageId: v.id("messages") },
  handler: async (ctx, { roomId, messageId }) => {
    let content = "";
    let flushedContent = "";
    let failed = false;

    const flush = async () => {
      if (content !== flushedContent) {
        await ctx.runMutation(internal.gm.updateContent, {
          messageId,
          content,
        });
        flushedContent = content;
      }
    };

    try {
      const { roomName, players, history } = await ctx.runQuery(
        internal.gm.context,
        { messageId }
      );

      const splitIndex = getHistorySplitIndex(history);
      const summary =
        splitIndex > 0
          ? await getSummaryThrough(ctx, roomId, history[splitIndex - 1].index)
          : "";

      const prompt: LlmMessage[] = [
        ...makeInitialSystemMessage(roomName, players, summary),
        ...history.slice(splitIndex).map(toApiMessage),
      ];

      const parser = new ActionParser();
      let lastFlush = Date.now();
      for await (const delta of streamText(prompt)) {
        content += delta;
        const actions = parser.push(delta);
        if (actions.length > 0 || Date.now() - lastFlush > FLUSH_INTERVAL_MS) {
          await flush();
          lastFlush = Date.now();
        }
        for (const action of actions) {
          await ctx.runMutation(internal.gm.processAction, {
            roomId,
            messageId,
            action,
          });
        }
      }
    } catch (error) {
      console.error("[gm] Response failed:", error);
      failed = true;
      if (error instanceof LlmRefusalError) {
        // A declined response's partial text shouldn't be kept.
        content = "";
      }
    }

    await ctx.runMutation(internal.gm.finish, {
      roomId,
      messageId,
      content: content.trim() || (failed ? FAILED_RESPONSE_TEXT : "..."),
    });
  },
});

export const updateContent = internalMutation({
  args: { messageId: v.id("messages"), content: v.string() },
  handler: async (ctx, { messageId, content }) => {
    const message = await ctx.db.get(messageId);
    if (message && !message.complete) {
      await ctx.db.patch(messageId, { content });
    }
  },
});

/** Carries out an action the GM wrote into its message. */
export const processAction = internalMutation({
  args: {
    roomId: v.id("rooms"),
    messageId: v.id("messages"),
    action: messageActionValidator,
  },
  handler: async (ctx, { roomId, messageId, action: rawAction }) => {
    const action = rawAction as GameMasterAction;
    const message = await ctx.db.get(messageId);
    if (!message) {
      return;
    }
    await ctx.db.patch(messageId, { actions: [...message.actions, action] });

    switch (action.name) {
      case "DrawCharacter":
      case "DrawLocation": {
        const description = action.args[0];
        if (!description) {
          return;
        }
        // Add the image slot now so it appears in order; the URL comes later.
        const imageIndex = message.images.length;
        await ctx.db.patch(messageId, {
          images: [...message.images, { description }],
        });
        await ctx.scheduler.runAfter(0, internal.gm.drawMessageImage, {
          messageId,
          imageIndex,
          kind: action.name === "DrawCharacter" ? "character" : "location",
          description,
        });
        return;
      }
      case "GiveItem": {
        const [characterName, itemName, itemDescription, quantity] =
          action.args;
        if (characterName && itemName) {
          await giveItem(ctx, roomId, characterName, {
            name: itemName,
            description: itemDescription ?? "",
            quantity: Number(quantity) || 1,
          });
        }
        return;
      }
      case "RemoveItem": {
        const [characterName, itemName, quantity] = action.args;
        if (characterName && itemName) {
          await removeItem(
            ctx,
            roomId,
            characterName,
            itemName,
            Number(quantity) || undefined
          );
        }
        return;
      }
    }
  },
});

export const drawMessageImage = internalAction({
  args: {
    messageId: v.id("messages"),
    imageIndex: v.number(),
    kind: v.union(v.literal("character"), v.literal("location")),
    description: v.string(),
  },
  handler: async (ctx, { messageId, imageIndex, kind, description }) => {
    const url =
      kind === "character"
        ? await drawStoryCharacter(ctx, description)
        : await drawStoryScene(ctx, description);
    await ctx.runMutation(internal.gm.setMessageImage, {
      messageId,
      imageIndex,
      url,
    });
  },
});

export const setMessageImage = internalMutation({
  args: {
    messageId: v.id("messages"),
    imageIndex: v.number(),
    url: v.string(),
  },
  handler: async (ctx, { messageId, imageIndex, url }) => {
    const message = await ctx.db.get(messageId);
    if (!message || !message.images[imageIndex]) {
      return;
    }
    await ctx.db.patch(messageId, {
      images: message.images.map((image, i) =>
        i === imageIndex ? { ...image, url } : image
      ),
    });
  },
});

/** Completes the message and starts the next response if one was requested meanwhile. */
export const finish = internalMutation({
  args: {
    roomId: v.id("rooms"),
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, { roomId, messageId, content }) => {
    const message = await ctx.db.get(messageId);
    if (message && !message.complete) {
      await ctx.db.patch(messageId, { content, complete: true });
      await ctx.scheduler.runAfter(0, internal.summaries.catchUp, { roomId });
    }

    const room = await ctx.db.get(roomId);
    if (!room) {
      return;
    }
    if (room.gm.pending) {
      await startGmResponse(ctx, roomId);
    } else {
      await ctx.db.patch(roomId, {
        gm: { responding: false, pending: false },
      });
    }
  },
});

/**
 * Index into `history` where verbatim messages start. Walks back from the end
 * until about LAST_CHATS_MAX_CHARACTERS of content is included.
 */
function getHistorySplitIndex(history: HistoryMessage[]): number {
  let count = 0;
  let splitIndex = history.length;
  while (splitIndex > 0 && count < LAST_CHATS_MAX_CHARACTERS) {
    splitIndex -= 1;
    count += history[splitIndex].content.length;
  }
  return splitIndex;
}

export function toApiMessage(message: HistoryMessage): LlmMessage {
  return { role: message.role, name: message.name, content: message.content };
}
