import { RoomListItem } from "../common/models/roomListModel";
import { Room } from "./Room";
import { WebError } from "./WebError";
import { idMaker } from "./utils/idMaker";

const rooms = new Map<string, Room>();

export function getRoom(roomId: string): Room {
  const room = rooms.get(roomId);
  if (room === undefined) {
    throw new WebError("Room not found: " + roomId, 404);
  }
  return room;
}

const makeId = idMaker();

export async function createRoom(id?: string) {
  if (id === undefined) {
    do {
      id = String(makeId());
    } while (rooms.has(id));
  }
  console.log("creating new room: ", id);
  const room = new Room(id);
  await room.init();
  if (rooms.has(id)) {
    throw new WebError("Can't create room that already exists: " + id, 400);
  }
  rooms.set(id, room);
  return room;
}

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
