import { OpenAIApi, Configuration as OpenAiConfiguration } from "openai";
import { getOpenAiKey } from "./envUtils";
import { makeSingleton } from "./makeSingleton";

export const openAi = makeSingleton(
  () =>
    new OpenAIApi(
      new OpenAiConfiguration({
        apiKey: getOpenAiKey(),
      })
    )
);
