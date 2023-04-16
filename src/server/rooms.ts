import { RoomList, RoomListItem } from "../common/models/roomListModel";
import { Room } from "./Room";

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    console.log("creating new room: ", roomId);
    rooms.set(roomId, new Room(roomId));
  }
  return rooms.get(roomId)!;
}

export function listRooms(): RoomListItem[] {
  return [...rooms.values()].map(
    (room): RoomListItem => ({
      id: room.id,
      name: room.name,
      players: 1, // TODO: Actual player count
    })
  );
}
