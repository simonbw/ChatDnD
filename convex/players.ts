import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";
import { drawInventoryItem } from "./lib/images";
import { scheduleItemDrawing, setInventory } from "./lib/inventory";
import { playerJoinMessage } from "./lib/prompts/roomEventPrompts";
import {
  PLAYER_LIMIT,
  addMessage,
  findPlayer,
  getRoomOrThrow,
  getRoomPlayers,
  requestGmResponse,
  toPlayer,
} from "./lib/roomHelpers";
import { playerValidator } from "./lib/validators";

export const join = mutation({
  args: { roomId: v.id("rooms"), player: playerValidator },
  handler: async (ctx, { roomId, player }) => {
    await getRoomOrThrow(ctx, roomId);
    const players = await getRoomPlayers(ctx, roomId);
    if (players.length >= PLAYER_LIMIT) {
      throw new ConvexError("This room is not open to join");
    }
    if (players.some((p) => p.playerId === player.id)) {
      throw new ConvexError("You have already joined this room");
    }

    await ctx.db.insert("players", {
      roomId,
      playerId: player.id,
      name: player.name,
      pronouns: player.pronouns,
      character: player.character,
    });

    await addMessage(
      ctx,
      roomId,
      playerJoinMessage(player, players.map(toPlayer))
    );
    await requestGmResponse(ctx, roomId);
  },
});

/** Redraws the pictures of everything in a player's inventory. */
export const redrawInventory = mutation({
  args: { roomId: v.id("rooms"), playerId: v.string() },
  handler: async (ctx, { roomId, playerId }) => {
    const player = await findPlayer(ctx, roomId, playerId);
    if (!player) {
      throw new ConvexError("You need to join this room first");
    }
    for (const item of player.character.inventory) {
      await scheduleItemDrawing(ctx, player._id, item);
    }
  },
});

export const drawItem = internalAction({
  args: {
    playerDocId: v.id("players"),
    itemName: v.string(),
    itemDescription: v.string(),
  },
  handler: async (ctx, { playerDocId, itemName, itemDescription }) => {
    const imageUrl = await drawInventoryItem(ctx, {
      name: itemName,
      description: itemDescription,
    });
    await ctx.runMutation(internal.players.setItemImage, {
      playerDocId,
      itemName,
      imageUrl,
    });
  },
});

export const setItemImage = internalMutation({
  args: {
    playerDocId: v.id("players"),
    itemName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, { playerDocId, itemName, imageUrl }) => {
    const player = await ctx.db.get(playerDocId);
    if (!player) {
      return;
    }
    await setInventory(
      ctx,
      player,
      player.character.inventory.map((i) =>
        i.name === itemName ? { ...i, imageUrl } : i
      )
    );
  },
});
