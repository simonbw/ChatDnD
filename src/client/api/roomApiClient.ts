import {
  joinRoomRequestSchema,
  joinRoomResponseSchema,
} from "../../common/api-schemas/roomApiSchemas";
import { routes } from "../../common/routes";
import { makeJsonEndpoint } from "./apiUtil";

export const joinRoom = (roomId: string) =>
  makeJsonEndpoint(
    "post",
    routes.room.join(roomId),
    joinRoomRequestSchema,
    joinRoomResponseSchema
  );
