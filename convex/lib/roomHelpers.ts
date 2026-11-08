import { ConvexError } from "convex/values";
import type { Player } from "../../src/common/models/playerModel";
import type { RoomMessage } from "../../src/common/models/roomModel";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/** Maximum number of players in a campaign. */
export const PLAYER_LIMIT = 6;

/**
 * Actions are killed after 10 minutes, so a response that has been "running"
 * longer than this crashed without cleaning up.
 */
const STALE_RESPONSE_MS = 11 * 60 * 1000;

export async function getRoomOrThrow(
  ctx: QueryCtx,
  roomId: Id<"rooms">
): Promise<Doc<"rooms">> {
  const room = await ctx.db.get(roomId);
  if (!room) {
    throw new ConvexError("Room not found");
  }
  return room;
}

export async function getRoomPlayers(
  ctx: QueryCtx,
  roomId: Id<"rooms">
): Promise<Doc<"players">[]> {
  return await ctx.db
    .query("players")
    .withIndex("by_room_player", (q) => q.eq("roomId", roomId))
    .collect()
    .then((players) =>
      players.sort((a, b) => a._creationTime - b._creationTime)
    );
}

export async function findPlayer(
  ctx: QueryCtx,
  roomId: Id<"rooms">,
  playerId: string
): Promise<Doc<"players"> | null> {
  return await ctx.db
    .query("players")
    .withIndex("by_room_player", (q) =>
      q.eq("roomId", roomId).eq("playerId", playerId)
    )
    .unique();
}

export function toPlayer(doc: Doc<"players">): Player {
  return {
    id: doc.playerId,
    name: doc.name,
    pronouns: doc.pronouns,
    character: doc.character,
  };
}

/** Converts a message to the shape the client uses. */
export function toRoomMessage(doc: Doc<"messages">): RoomMessage {
  return {
    id: doc.index,
    role: doc.role,
    content: doc.content,
    publicContent: doc.publicContent,
    createdAt: new Date(doc._creationTime).toISOString(),
    name: doc.name,
    whispered: doc.whispered,
    images: doc.images,
    actions: doc.actions,
    complete: doc.complete,
  };
}

/**
 * Converts a message to one for players to see, or null if it isn't meant to
 * be seen (system messages without public content).
 */
export function toPublicMessage(doc: Doc<"messages">): RoomMessage | null {
  const message = toRoomMessage(doc);
  if (message.role === "system") {
    if (!message.publicContent) {
      return null;
    }
    return {
      ...message,
      content: message.publicContent,
      publicContent: undefined,
    };
  }
  if (!message.complete && !message.content) {
    return { ...message, content: "..." };
  }
  return message;
}

type NewMessage = Pick<
  Doc<"messages">,
  "role" | "content" | "publicContent" | "name" | "whispered"
> &
  Partial<Pick<Doc<"messages">, "images" | "actions" | "complete">>;

/** Appends a message to the end of a room's history. */
export async function addMessage(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  message: NewMessage
): Promise<Id<"messages">> {
  const last = await ctx.db
    .query("messages")
    .withIndex("by_room_index", (q) => q.eq("roomId", roomId))
    .order("desc")
    .first();
  const messageId = await ctx.db.insert("messages", {
    roomId,
    index: last ? last.index + 1 : 0,
    role: message.role,
    content: message.content.trim(),
    publicContent: message.publicContent,
    name: message.name,
    whispered: message.whispered,
    images: message.images ?? [],
    actions: message.actions ?? [],
    complete: message.complete ?? true,
  });
  if (message.complete ?? true) {
    await ctx.scheduler.runAfter(0, internal.summaries.catchUp, { roomId });
  }
  return messageId;
}

/**
 * Asks the Game Master to respond to the room. Only one response runs at a
 * time; a request made while one is running is answered once it finishes.
 */
export async function requestGmResponse(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  const room = await getRoomOrThrow(ctx, roomId);
  const { responding, startedAt } = room.gm;
  const stale = responding && Date.now() - (startedAt ?? 0) > STALE_RESPONSE_MS;

  if (responding && !stale) {
    await ctx.db.patch(roomId, { gm: { ...room.gm, pending: true } });
    return;
  }

  if (stale) {
    console.warn(`[gm] Recovering from a crashed response in room ${roomId}`);
    await closeIncompleteMessages(ctx, roomId);
  }

  await startGmResponse(ctx, roomId);
}

/** Inserts the GM's placeholder message and schedules the response. */
export async function startGmResponse(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  await ctx.db.patch(roomId, {
    gm: { responding: true, startedAt: Date.now(), pending: false },
  });
  const messageId = await addMessage(ctx, roomId, {
    role: "assistant",
    name: "ChatDnD",
    content: "",
    complete: false,
  });
  await ctx.scheduler.runAfter(0, internal.gm.respond, { roomId, messageId });
}

async function closeIncompleteMessages(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  const incomplete = await ctx.db
    .query("messages")
    .withIndex("by_room_complete_index", (q) =>
      q.eq("roomId", roomId).eq("complete", false)
    )
    .collect();
  for (const message of incomplete) {
    await ctx.db.patch(message._id, { complete: true });
  }
}
