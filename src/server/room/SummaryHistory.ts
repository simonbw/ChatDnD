import { ChatCompletionRequestMessage } from "openai";
import { z } from "zod";
import { WebError } from "../WebError";
import { Channel } from "../utils/Channel";
import { getSummarizingGPTModel } from "../utils/envUtils";
import { simpleTextResponse } from "../utils/openAiUtils";
import { Room } from "./Room";
import { SerializedRoom } from "./roomSerialization";

export class SummaryHistory {
  public onUpdate = new Channel<void>();

  completedSummaries: Map<number, string> = new Map();
  summaries: Map<number, Promise<string>> = new Map();
  room: Room;

  constructor(room: Room, data: SerializedRoom["summaryHistory"] = {}) {
    this.room = room;

    for (const [k, summary] of Object.entries(data)) {
      const chatIndex = z.coerce.number().parse(k);
      this.summaries.set(chatIndex, Promise.resolve(summary));
    }

    room.messages.onAddComplete.subscribe((finalMessage) => {
      // Eagerly start creating summaries
      this.getSummary(finalMessage.id);
    });
  }

  toJson(): SerializedRoom["summaryHistory"] {
    return Object.fromEntries(this.completedSummaries);
  }

  async getSummary(chatIndex: number): Promise<string> {
    if (
      chatIndex < 0 ||
      chatIndex >= this.room.messages.getApiMessages().length
    ) {
      throw new WebError(`chatIndex out of bounds: ${chatIndex}`, 500);
    }

    if (this.summaries.has(chatIndex)) {
      return this.summaries.get(chatIndex)!;
    } else {
      const previousSummary =
        chatIndex === 0 ? Promise.resolve("") : this.getSummary(chatIndex - 1);
      console.log(`[summaryHistory] Summarizing chat #${chatIndex}`);
      const messageToAdd = this.room.messages.getApiMessage(chatIndex);
      const summaryPromise = summarize(previousSummary, messageToAdd);
      this.summaries.set(chatIndex, summaryPromise);
      summaryPromise.then((summary) => {
        this.completedSummaries.set(chatIndex, summary);
        this.onUpdate.publish();
      });
      return summaryPromise;
    }
  }
}

// TODO: Include more than one message for summary?
async function summarize(
  oldSummary: Promise<string>,
  incomingMessage: ChatCompletionRequestMessage
): Promise<string> {
  const incomingText = `[${incomingMessage.name}] ${incomingMessage.content}`;
  const lines = [
    `You are an AI that progressively summarizes a tabletop RPG game as it is played.`,
    `You will be given the summary of the conversation so far, as well as the most recent message in the conversation.`,
    `Please respond with a new summary of the whole conversation including the latest message.`,
    `Respond only with your new summary.`,
    `Your response MUST be less than 1000 words.`,
    ``,
    `Summary so far \`\`\`${await oldSummary}\`\`\``,
    ``,
    `Latest message \`\`\`${incomingText}\`\`\``,
  ];

  const newSummary = await simpleTextResponse(
    [
      {
        role: "system",
        content: lines.join("\n"),
      },
    ],
    { temperature: 0.0, model: getSummarizingGPTModel() } // Consistent
  );

  // TODO: Guarantee length.

  return newSummary;
}
