import {
  joinRoomRequestSchema,
  joinRoomResponseSchema,
  redrawInventoryRequestSchema,
} from "../../common/api-schemas/roomApiSchemas";
import { genericResponseSchema } from "../../common/models/apiSchemas";
import { routes } from "../../common/routes";
import { makeJsonEndpoint } from "./apiUtil";

export const roomApiClient = {
  joinRoom: (roomId: string) =>
    makeJsonEndpoint(
      "post",
      routes.room.join(roomId),
      joinRoomRequestSchema,
      joinRoomResponseSchema
    ),

  redrawInventory: (roomId: string) =>
    makeJsonEndpoint(
      "post",
      routes.room.redrawInventory(roomId),
      redrawInventoryRequestSchema,
      genericResponseSchema
    ),
};
