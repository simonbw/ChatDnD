import { RequestHandler } from "express";
import { withRoomIdSchema } from "../../../common/models/apiSchemas";
import { Room } from "../../Room";
import { WebError } from "../../WebError";
import { RoomStore } from "../../roomStore";

export const withRoom: <
  TParams,
  TResBody,
  ReqBody,
  ReqQuery,
  Locals extends Record<string, any> = Record<string, any>
>() => RequestHandler<
  TParams & { room: Room },
  TResBody,
  ReqBody,
  ReqQuery,
  Locals
> = () => (req, res, next) => {
  const maybeRoomId = withRoomIdSchema.safeParse(req.params);
  if (!maybeRoomId.success) {
    throw new WebError("Missing roomId parameter", 400);
  }
  req.params.room = RoomStore.instance.getRoom(maybeRoomId.data.roomId);
  next();
};
