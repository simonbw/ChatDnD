import { RoomList, RoomListItem } from "../common/models/roomListModel";
import { Room } from "./Room";
import { idMaker } from "./utils/idMaker";

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    console.log("creating new room: ", roomId);
    rooms.set(roomId, new Room(roomId));
  }
  return rooms.get(roomId)!;
}

const makeId = idMaker();

export function getNextRoom(): Room {
  let id = String(makeId());
  while (rooms.has(id)) {
    id = String(makeId());
  }
  return getRoom(id);
}

export function listRooms(playerId?: string): RoomListItem[] {
  return [...rooms.values()]
    .filter(
      (room) =>
        playerId === undefined ||
        room.getPlayers().some((player) => player.id === playerId)
    )
    .map(
      (room): RoomListItem => ({
        id: room.id,
        name: room.name,
        players: room.getPlayers(),
      })
    );
}
