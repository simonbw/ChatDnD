import { OpenAIApi, Configuration as OpenAiConfiguration } from "openai";
import { getOpenAikey } from "./utils/envUtils";

export const openAi = makeSingleton(
  () =>
    new OpenAIApi(
      new OpenAiConfiguration({
        apiKey: getOpenAikey(),
      })
    )
);

function makeSingleton<T>(maker: () => T): () => T {
  let instance: T;

  return () => {
    if (instance === undefined) {
      instance = maker();
    }
    return instance;
  };
}
