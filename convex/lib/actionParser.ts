import { z } from "zod";
import { actionNameEnum } from "./prompts/abilitiesPromptContent";

export interface GameMasterAction {
  name: z.infer<typeof actionNameEnum>;
  args: string[];
}

export function parseGMAction(text: string): GameMasterAction | null {
  const [name, ...args] = text.split("|");

  const parsedName = actionNameEnum.safeParse(name.trim());
  if (!parsedName.success) {
    return null;
  }

  return {
    name: parsedName.data,
    args: args.map((arg) => arg.trim()),
  };
}

/**
 * Picks `{ActionName|arg|arg}` actions out of streaming text, one delta at a
 * time. The text itself is left alone; the client hides the braces.
 */
export class ActionParser {
  private currentActionText: string | undefined = undefined;

  /** Feeds in more text and returns any actions completed by it. */
  push(text: string): GameMasterAction[] {
    const completed: GameMasterAction[] = [];
    for (const char of text) {
      if (this.currentActionText === undefined) {
        if (char === "{") {
          this.currentActionText = "";
        }
      } else if (char === "}") {
        const action = parseGMAction(this.currentActionText);
        if (action) {
          completed.push(action);
        }
        this.currentActionText = undefined;
      } else {
        this.currentActionText += char;
      }
    }
    return completed;
  }
}
