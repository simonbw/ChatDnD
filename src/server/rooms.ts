import { Room } from "./Room";

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    console.log("creating new room: ", roomId);
    rooms.set(roomId, new Room());
  }
  return rooms.get(roomId)!;
}
