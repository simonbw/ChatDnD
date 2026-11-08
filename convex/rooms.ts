import { v } from "convex/values";
import type { RoomListItem } from "../src/common/models/roomListModel";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { getGenerationGPTModel } from "./lib/env";
import { cleanupChatResponse, simpleTextResponse } from "./lib/openAiUtils";
import { PLAYER_LIMIT, getRoomPlayers, toPlayer } from "./lib/roomHelpers";

/** Room metadata and players. Messages come from `messages.listComplete` / `listInProgress`. */
export const get = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId: rawRoomId }) => {
    const roomId = ctx.db.normalizeId("rooms", rawRoomId);
    const room = roomId && (await ctx.db.get(roomId));
    if (!room) {
      return null;
    }
    const players = await getRoomPlayers(ctx, room._id);
    return {
      id: room._id as string,
      name: room.name,
      createdAt: new Date(room._creationTime).toISOString(),
      openToJoin: players.length < PLAYER_LIMIT,
      players: players.map(toPlayer),
    };
  },
});

/** Campaigns the given player has joined, newest first. */
export const listForPlayer = query({
  args: { playerId: v.string() },
  handler: async (ctx, { playerId }) => {
    const memberships = await ctx.db
      .query("players")
      .withIndex("by_player", (q) => q.eq("playerId", playerId))
      .collect();
    const rooms = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.roomId))
    );
    const existing = rooms.filter(
      (room): room is Doc<"rooms"> => room !== null
    );
    existing.sort((a, b) => b._creationTime - a._creationTime);
    return await Promise.all(existing.map((room) => toListItem(ctx, room)));
  },
});

/** The most recently started campaigns. */
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rooms = await ctx.db
      .query("rooms")
      .order("desc")
      .take(Math.min(limit ?? 10, 50));
    return await Promise.all(rooms.map((room) => toListItem(ctx, room)));
  },
});

/** Starts a new campaign with a generated name. Returns its id. */
export const create = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const name = await generateCampaignName();
    const roomId: Id<"rooms"> = await ctx.runMutation(internal.rooms.insert, {
      name,
    });
    return roomId;
  },
});

export const insert = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    return await ctx.db.insert("rooms", {
      name,
      gm: { responding: false, pending: false },
    });
  },
});

/**
 * Debug: clears a room's story but keeps its players. Run it from the Convex
 * dashboard (Functions → rooms:softReset).
 */
export const softReset = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    for (const table of ["messages", "summaries"] as const) {
      const docs = await ctx.db
        .query(table)
        .withIndex("by_room_index", (q) => q.eq("roomId", roomId))
        .collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    await ctx.db.patch(roomId, { gm: { responding: false, pending: false } });
  },
});

async function toListItem(
  ctx: QueryCtx,
  room: Doc<"rooms">
): Promise<RoomListItem> {
  const players = await getRoomPlayers(ctx, room._id);
  return {
    id: room._id,
    name: room.name,
    players: players.map((p) => ({ id: p.playerId, name: p.character.name })),
  };
}

async function generateCampaignName(): Promise<string> {
  try {
    const content = await simpleTextResponse(
      [
        {
          role: "user",
          content:
            "Please come up with a unique title for a Dungeons & Dragons campaign. Please respond with only the title, and no punctuation.",
        },
      ],
      { model: getGenerationGPTModel() }
    );
    return cleanupChatResponse(content, { singlePhrase: true });
  } catch (error) {
    console.error("[rooms] Failed to generate campaign name:", error);
    return "An Untitled Adventure";
  }
}
