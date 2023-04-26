import { RoomListItem } from "../common/models/roomListModel";
import { roomStateSchema } from "../common/models/roomModel";
import { Room, RoomData, RoomId, roomSaveSchema } from "./Room";
import { WebError } from "./WebError";
import { getDb } from "./db";
import rethink from "rethinkdb";

export const roomTable = rethink.db("chatdnd").table("rooms");

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
      } while (this.rooms.has(id));
    }
    console.log("creating new room: ", id);
    const room = new Room(id);
    await room.init();
    if (this.rooms.has(id)) {
      throw new WebError("Can't create room that already exists: " + id, 400);
    }
    this.rooms.set(id, room);
    return room;
  }

  private makeId() {
    return String(this.lastId++);
  }

  public hasRoom(roomId: RoomId): boolean {
    return this.rooms.has(roomId);
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
      const db = await getDb();
      const cursor = await roomTable.run(db);
      const roomDatas = await cursor.toArray();
      console.log("loading rooms:", roomDatas.length);
      for (const roomData of roomDatas) {
        const parsed = roomSaveSchema.safeParse(roomData);
        if (parsed.success) {
          console.log("Parsed room with id", parsed.data.id);
          if (!this.hasRoom(parsed.data.id)) {
            const room = new Room(roomData.id);
            room.fromJson(roomData);
            this.rooms.set(room.id, room);
          }
        } else {
          console.log("Found invalid saved room", parsed.error);
        }
      }
    } catch (error) {
      console.error("error loading rooms", error);
    }
  }

  async saveRooms() {
    const db = await getDb();
    const toWrite = [...this.rooms.values()].map((r) => r.toJson());
    await roomTable.insert(toWrite, { conflict: "replace" }).run(db);
  }
}
