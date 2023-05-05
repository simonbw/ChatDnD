import rethink from "rethinkdb";
import { RoomListItem } from "../../common/models/roomListModel";
import { WebError } from "../WebError";
import { getDb } from "../db";
import { Room } from "./Room";
import { RoomId, roomSaveSchema } from "./roomSerialization";

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

  private constructor() {}

  public async createRoom(id?: RoomId): Promise<Room> {
    if (id === undefined) {
      id = this.makeId();
    }
    console.log("creating new room: ", id);
    const room = await Room.createEmpty(id);
    if (this.rooms.has(id)) {
      throw new WebError("Can't create room that already exists: " + id, 400);
    }
    this.rooms.set(id, room);
    return room;
  }

  private makeId() {
    // TODO: This is trash. Should use the database for generating unique id
    let id: RoomId;
    do {
      id = String(this.lastId++);
    } while (this.rooms.has(id));
    return id;
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
          room.players.all.some((player) => player.id === playerId)
      )
      .map(
        (room): RoomListItem => ({
          id: room.id,
          name: room.name,
          players: room.players.all.map((p) => ({
            id: p.id,
            name: p.character.name,
          })),
        })
      )
      .slice(0, limit ?? Infinity);
  }

  public clear(): RoomStore {
    this.rooms = new Map();
    return this;
  }

  public deleteRoom(roomId: RoomId): RoomStore {
    this.rooms.delete(roomId);
    return this;
  }

  public async initialize(): Promise<RoomStore> {
    console.log("[RoomStore] Initializing room store...");
    await this.loadRooms();
    console.log("[RoomStore] Room store initialized");
    return this;
  }

  async loadRooms() {
    try {
      const db = await getDb();
      const cursor = await roomTable.run(db);
      const roomDatas = await cursor.toArray();
      console.log(`[RoomStore] loading ${roomDatas.length} rooms:`);
      for (const roomData of roomDatas) {
        const parsed = roomSaveSchema.safeParse(roomData);
        if (parsed.success) {
          console.log("[RoomStore] Parsed room with id", parsed.data.id);
          if (!this.hasRoom(parsed.data.id)) {
            const room = new Room(roomData);
            this.rooms.set(room.id, room);
          } else {
            console.log("[RoomStore] Room already loaded:", parsed.data.id);
          }
        } else {
          console.log("[RoomStore] Found invalid saved room:", parsed.error);
        }
      }
    } catch (error) {
      console.error("[RoomStore] Error loading rooms:", error);
    }
  }

  async saveRooms() {
    const db = await getDb();
    const toWrite = [...this.rooms.values()].map((r) => r.toJson());
    await roomTable.insert(toWrite, { conflict: "replace" }).run(db);
  }
}
