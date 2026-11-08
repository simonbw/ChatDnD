import { ConvexError, v } from "convex/values";
import type { RoomMessage } from "../src/common/models/roomModel";
import { mutation, query } from "./_generated/server";
import {
  addMessage,
  findPlayer,
  getRoomOrThrow,
  requestGmResponse,
  toPublicMessage,
} from "./lib/roomHelpers";

/*
 * Finished and in-progress messages are separate queries on purpose. While the
 * GM is writing, its message changes several times a second; keeping it out
 * of `listComplete` means those updates only resend the one message instead of
 * the whole history.
 */

export const listComplete = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_complete_index", (q) =>
        q.eq("roomId", roomId).eq("complete", true)
      )
      .collect();
    return messages
      .map(toPublicMessage)
      .filter((m): m is RoomMessage => m !== null);
  },
});

export const listInProgress = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_complete_index", (q) =>
        q.eq("roomId", roomId).eq("complete", false)
      )
      .collect();
    return messages
      .map(toPublicMessage)
      .filter((m): m is RoomMessage => m !== null);
  },
});

export const send = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.string(),
    content: v.string(),
    whispered: v.optional(v.boolean()),
  },
  handler: async (ctx, { roomId, playerId, content, whispered }) => {
    await getRoomOrThrow(ctx, roomId);
    const player = await findPlayer(ctx, roomId, playerId);
    if (!player) {
      throw new ConvexError("You need to join this room first");
    }
    if (!content.trim()) {
      throw new ConvexError("Message is empty");
    }

    await addMessage(ctx, roomId, {
      role: "user",
      name: player.character.name,
      content,
      whispered,
    });

    if (!whispered) {
      await requestGmResponse(ctx, roomId);
    }
  },
});
