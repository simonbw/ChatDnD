import { AxiosResponse } from "axios";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  OpenAIApi,
  Configuration as OpenAiConfiguration,
} from "openai";
import { Readable } from "stream";
import { z } from "zod";
import { last } from "../../common/utils/arrayUtils";
import { WebError } from "../WebError";
import { getGPTModel, getOpenAiKey } from "./envUtils";
import { makeSingleton } from "./makeSingleton";

export const openAi = makeSingleton(
  () =>
    new OpenAIApi(
      new OpenAiConfiguration({
        apiKey: getOpenAiKey(),
      })
    )
);

export function parseDeltaStream(raw: Uint8Array): OpenAiStreamMessageDelta[] {
  const lines = raw
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return lines
    .map((rawLine) => {
      if (rawLine.includes("[DONE]")) {
        return null;
      }

      const line = rawLine.replace(/^data: /, "");

      try {
        const data = streamMessageSchema.parse(JSON.parse(line));
        return data.choices[0].delta;
      } catch (e) {
        console.log("[OpenAi] failed to parse:\n", line, "\n\n");
        return null;
      }
    })
    .filter((delta): delta is OpenAiStreamMessageDelta => delta != null);
}

export function apiSafeName(name?: string): string | undefined {
  return name?.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function simpleTextResponse(
  messages: ChatCompletionRequestMessage[],
  config: Partial<CreateChatCompletionRequest> = {}
) {
  const chatResponse = await openAi().createChatCompletion({
    model: getGPTModel(),
    messages,
    ...config,
  });

  const content = chatResponse.data.choices[0].message?.content;
  if (!content) {
    throw new WebError("Chat API did not return any content", 500);
  }
  return content;
}

export async function streamTextResponse(
  messages: ChatCompletionRequestMessage[],
  chatConfig: Partial<CreateChatCompletionRequest> = {}
): Promise<Readable> {
  const config = {
    model: getGPTModel(),
    messages,
    ...chatConfig,
    stream: true,
  };
  try {
    const chatResponse = (await openAi().createChatCompletion(config, {
      responseType: "stream",
    })) as any as AxiosResponse<Readable>; // because the API is improperly typed
    return chatResponse.data;
  } catch (error: any) {
    console.error("streamTextResponse failed:", config);
    throw new WebError(
      `streamTextResponse() openAi request failed with message: ${error.message}`,
      500
    );
  }
}

export function cleanupChatResponse(
  content: string,
  options: { stripQuotes?: boolean; singlePhrase?: boolean } = {}
): string {
  const { stripQuotes = true, singlePhrase = false } = options;
  let result = content;

  if (stripQuotes) {
    result = result.replace(/"/g, "");
  }

  if (singlePhrase && last(result) == ".") {
    result = result.substring(0, result.length - 1);
  }

  return result;
}

export const openAiStreamMessageDeltaSchema = z.object({
  content: z.string().optional(),
  role: z.string().optional(),
  name: z.string().optional(),
});

export const streamMessageSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      delta: openAiStreamMessageDeltaSchema,
      index: z.number(),
      finish_reason: z.union([
        z.literal("stop"),
        z.literal("length"),
        z.literal("content_filter"),
        z.null(),
      ]),
    })
  ),
});

export type OpenAiStreamMessageDelta = z.infer<
  typeof openAiStreamMessageDeltaSchema
>;
