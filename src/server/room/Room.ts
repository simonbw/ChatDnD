import { Player } from "../../common/models/playerModel";
import { RoomPublicState } from "../../common/models/roomModel";
import { WebError } from "../WebError";
import { getDb } from "../db";
import { ActionQueue } from "../utils/ActionQueue";
import { Channel } from "../utils/Channel";
import { DiffChannel } from "../utils/DiffChannel";
import { GameMaster } from "./GameMaster";
import { RoomMessages } from "./RoomMessages";
import { RoomPlayers } from "./RoomPlayers";
import { SummaryHistory } from "./SummaryHistory";
import { generateCampaignName } from "./generateCampaignName";
import { RoomId, SerializedRoom } from "./roomSerialization";
import { roomTable } from "./roomStore";

// Maximum number of players in a campaign
const PLAYER_LIMIT = 6;

/**
 * All the information about a campaign.
 */
export class Room {
  // events
  public readonly onUpdate = new DiffChannel<RoomPublicState>();
  public readonly onPlayerAdded = new Channel<Player>();
  public readonly onPlayerRemoved = new Channel<Player>();
  private mainChatQueue = new ActionQueue();

  // serialized fields
  public id: RoomId;
  public name: string = "";
  public messages: RoomMessages;
  public summaryHistory: SummaryHistory;
  public players: RoomPlayers;
  public createdAt;
  private gameMaster: GameMaster;

  constructor(data: SerializedRoom) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;

    this.players = new RoomPlayers(data.players);
    this.players.onUpdate.subscribe(() => this.updated());

    this.messages = new RoomMessages(data.messages);
    this.messages.onUpdate.subscribe(() => this.updated());

    this.summaryHistory = new SummaryHistory(this, data.summaryHistory);
    this.summaryHistory.onUpdate.subscribe(() => this.updated());

    this.gameMaster = new GameMaster(this, data.gameMaster);
  }

  static async createEmpty(id: RoomId): Promise<Room> {
    return new Room({
      id,
      createdAt: new Date().toISOString(),
      messages: [],
      name: await generateCampaignName(),
      players: [],
      summaryHistory: {},
      gameMaster: {},
    });
  }

  toJson(): SerializedRoom {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      players: this.players.toJson(),
      messages: this.messages.toJson(),
      gameMaster: this.gameMaster.toJson(),
      summaryHistory: this.summaryHistory.toJson(),
    };
  }

  async save() {
    const serialized = this.toJson();
    await roomTable
      .insert(serialized, { conflict: "replace" })
      .run(await getDb());
  }

  isOpenToJoin(): boolean {
    return this.players.length < PLAYER_LIMIT;
  }

  updated() {
    this.onUpdate.stateChanged(this.getPublicState());
    this.save();
  }

  getPublicState(): RoomPublicState {
    return {
      messages: this.messages.getPublicMessages(),
      id: this.id,
      name: this.name,
      players: this.players.toJson(),
      createdAt: this.createdAt,
      openToJoin: this.isOpenToJoin(),
    };
  }

  softReset() {
    console.log(`Resetting room ${this.id}`);
    this.messages = new RoomMessages([]);
    this.messages.onUpdate.subscribe(() => this.updated());
    this.summaryHistory = new SummaryHistory(this, {});
    this.summaryHistory.onUpdate.subscribe(() => this.updated());
    this.gameMaster = new GameMaster(this, {});
    this.updated();
  }
}
