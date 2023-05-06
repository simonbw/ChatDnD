import { z } from "zod";
import { actionNameEnum } from "../prompts/abilitiesPromptContent";

export interface GameMasterAction {
  name: z.infer<typeof actionNameEnum>;
  args: string[];
}

export function parseGMAction(text: string): GameMasterAction | null {
  const [name, ...args] = text.split("|");

  const parsedName = actionNameEnum.safeParse(name);
  if (!parsedName.success) {
    return null;
  }

  return {
    name: parsedName.data,
    args,
  };
}

export { actionNameEnum };
