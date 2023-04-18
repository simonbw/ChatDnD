import { RoomList, RoomListItem } from "../common/models/roomListModel";
import { Room } from "./Room";

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    console.log("creating new room: ", roomId);
    const room = new Room(roomId);
    rooms.set(roomId, room);

    try {
      room.decideOnName();
    } catch (error) {
      console.error(error);
    }
  }
  return rooms.get(roomId)!;
}

export function listRooms(): RoomListItem[] {
  return [...rooms.values()].map(
    (room): RoomListItem => ({
      id: room.id,
      name: room.name,
      players: room.getPlayers(),
    })
  );
}
