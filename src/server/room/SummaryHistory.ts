import { ChatCompletionRequestMessage } from "openai";
import { z } from "zod";
import { WebError } from "../WebError";
import { Channel } from "../utils/Channel";
import { getSummarizingGPTModel } from "../utils/envUtils";
import { simpleTextResponse } from "../utils/openAiUtils";
import { Room } from "./Room";
import { SerializedRoom } from "./roomSerialization";

/**
 * Keeps track of summaries of messages.
 */
export class SummaryHistory {
  public onUpdate = new Channel<void>();

  /** Summaries that have actually returned and can be written to the db() */
  private completedSummaries: Map<number, string> = new Map();
  private summaryPromises: Map<number, Promise<string>> = new Map();
  room: Room;

  constructor(room: Room, data: SerializedRoom["summaryHistory"] = {}) {
    this.room = room;

    // Load existing summaries
    for (const [k, summary] of Object.entries(data)) {
      const chatIndex = z.coerce.number().parse(k);
      this.summaryPromises.set(chatIndex, Promise.resolve(summary));
    }

    // Eagerly start creating summaries
    room.messages.onAddComplete.subscribe((finalMessage) => {
      this.getSummary(finalMessage.id);
    });
  }

  toJson(): SerializedRoom["summaryHistory"] {
    return Object.fromEntries(this.completedSummaries);
  }

  async getSummary(messageId: number): Promise<string> {
    if (!this.room.messages.hasMessage(messageId)) {
      throw new WebError(`Message with ID does not exist: ${messageId}`, 400);
    }

    if (this.summaryPromises.has(messageId)) {
      return this.summaryPromises.get(messageId)!;
    } else {
      const previousSummary =
        messageId === 0 ? Promise.resolve("") : this.getSummary(messageId - 1);
      console.log(`[summaryHistory] Summarizing chat #${messageId}`);
      const messageToAdd = this.room.messages.getApiMessageById(messageId);
      const summaryPromise = messageToAdd
        ? summarize(previousSummary, messageToAdd) // if there's a new message, update the summary
        : previousSummary; // Otherwise just use the last summary
      this.summaryPromises.set(messageId, summaryPromise);
      summaryPromise.then((summary) => {
        // Make sure to store this summary when it's actually done
        this.completedSummaries.set(messageId, summary);
        this.onUpdate.publish();
      });
      return summaryPromise;
    }
  }

  getCompletedSummary(messageId: number): string | undefined {
    return this.completedSummaries.get(messageId);
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
    {
      model: getSummarizingGPTModel(),
      temperature: 0.0, // So we get consistent results. Summaries don't need to be creative.
    }
  );

  // TODO: Guarantee length.

  return newSummary;
}
