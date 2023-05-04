import { actionNameEnum } from "../prompts/abilitiesPromptContent";
import { z } from "zod";

export interface GameMasterAction {
  name: z.infer<typeof actionNameEnum>;
  args: string[];
}

export function parseGMAction(text: string): GameMasterAction {
  const [name, ...args] = text.split("|");

  const parsedName = actionNameEnum.parse(name);
  return {
    name: parsedName,
    args,
  };
}

export { actionNameEnum };
