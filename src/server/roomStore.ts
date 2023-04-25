import { RoomListItem } from "../common/models/roomListModel";
import { Room, RoomId } from "./Room";
import { WebError } from "./WebError";

const rooms = new Map<RoomId, Room>();

export class RoomStore {
  private rooms = new Map<RoomId, Room>();
  private lastId: number = 0;

  private static _instance: RoomStore;
  public static get instance(): RoomStore {
    if (!RoomStore._instance) {
      RoomStore._instance = new RoomStore();
    }
    return RoomStore._instance;
  }

  public async createRoom(id?: RoomId): Promise<Room> {
    if (id === undefined) {
      do {
        id = this.makeId();
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

  private makeId() {
    return String(this.lastId++);
  }

  public getRoom(roomId: RoomId): Room {
    const room = this.rooms.get(roomId);
    if (room === undefined) {
      throw new WebError("Room not found: " + roomId, 404);
    }
    return room;
  }

  public getRooms({
    playerId,
    limit,
  }: { playerId?: string; limit?: number } = {}): RoomListItem[] {
    return [...this.rooms.values()]
      .filter(
        (room) =>
          playerId === undefined ||
          room.getPlayers().some((player) => player.id === playerId)
      )
      .map(
        (room): RoomListItem => ({
          id: room.id,
          name: room.name,
          players: room
            .getPlayers()
            .map((p) => ({ id: p.id, name: p.character.name })),
        })
      )
      .slice(0, limit ?? Infinity);
  }

  public deleteRoom(roomId: RoomId): RoomStore {
    this.rooms.delete(roomId);
    return this;
  }

  public async initialize(): Promise<RoomStore> {
    console.log("Initializing room store");
    await this.loadRooms();
    console.log("Room store initialized");
    return this;
  }

  async loadRooms() {
    try {
    } catch (error) {}
  }

  async saveRooms() {
    const objectToWrite: Record<RoomId, object> = {};
    for (const [rooId, room] of this.rooms) {
      objectToWrite[room.id] = room.toJson();
    }
  }
}
