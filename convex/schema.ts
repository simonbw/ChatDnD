import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  characterValidator,
  messageActionValidator,
  messageImageValidator,
  messageRoleValidator,
  pronounsValidator,
} from "./lib/validators";

export default defineSchema({
  /** A campaign. */
  rooms: defineTable({
    name: v.string(),
    /**
     * Game Master state. Only one response is generated at a time per room;
     * messages that arrive mid-response set `pending` and get answered next.
     */
    gm: v.object({
      responding: v.boolean(),
      /** When the current response started, for detecting a crashed response. */
      startedAt: v.optional(v.number()),
      /** Another response was requested while this one was running. */
      pending: v.boolean(),
    }),
  }),

  players: defineTable({
    roomId: v.id("rooms"),
    /** Client-generated id kept in the browser's localStorage. */
    playerId: v.string(),
    name: v.string(),
    pronouns: pronounsValidator,
    character: characterValidator,
  })
    .index("by_room_player", ["roomId", "playerId"])
    .index("by_player", ["playerId"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    /** Position in the room's history, starting at 0. This is the message id clients see. */
    index: v.number(),
    role: messageRoleValidator,
    content: v.string(),
    /** Alternate content shown to players instead of `content` (system messages). */
    publicContent: v.optional(v.string()),
    name: v.optional(v.string()),
    /** Not said to the GM, so it doesn't trigger a response. */
    whispered: v.optional(v.boolean()),
    images: v.array(messageImageValidator),
    actions: v.array(messageActionValidator),
    /** False while the GM is still writing the message. */
    complete: v.boolean(),
  })
    .index("by_room_index", ["roomId", "index"])
    .index("by_room_complete_index", ["roomId", "complete", "index"]),

  /** Progressive summary of a room's history, through message `messageIndex`. */
  summaries: defineTable({
    roomId: v.id("rooms"),
    messageIndex: v.number(),
    summary: v.string(),
  }).index("by_room_index", ["roomId", "messageIndex"]),
});
