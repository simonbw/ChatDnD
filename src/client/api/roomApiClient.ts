import { z } from "zod";
import {
  joinRoomRequestSchema,
  joinRoomResponseSchema,
} from "../../common/api-schemas/roomApiSchemas";
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
};
