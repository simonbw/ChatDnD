import { RequestHandler } from "express";
import { withRoomIdSchema } from "../../../common/models/apiSchemas";
import { Room } from "../../Room";
import { WebError } from "../../WebError";
import { getRoom } from "../../roomStore";

export const withRoom: <TParams>() => RequestHandler<
  TParams & { room: Room }
> = () => (req, res, next) => {
  const maybeRoomId = withRoomIdSchema.safeParse(req.params);
  if (!maybeRoomId.success) {
    throw new WebError("Missing roomId parameter", 400);
  }
  req.params.room = getRoom(maybeRoomId.data.roomId);
  next();
};
