import { z } from "zod";
import { Player } from "../../common/models/playerModel";

export const actionNameEnum = z.enum([
  "DrawCharacter",
  "DrawScene",
  "GiveItem",
  "RemoveItem",
]);

interface Ability {
  name: z.infer<typeof actionNameEnum>;
  description: string;
  parameters: { name: string; description: string; optional?: boolean }[];
}

function abilityDescriptor(ability: Ability): string {
  const argNames = ability.parameters.map((a) => a.name);
  const argNumber = ability.parameters.length;
  const definition = `{${[ability.name, ...argNames].join("|")}}`;

  let body = `${ability.description.trim()} ${ability.name} takes `;
  if (argNumber === 0) {
    body += "no arguments.";
  } else if (argNumber === 1) {
    body += "one argument:";
  } else {
    body += `${argNumber} arguments:`;
  }

  const argumentDefinitions = ability.parameters.map(
    (arg) =>
      `  ${arg.name} - ${arg.optional ? "OPTIONAL" : "REQUIRED"} - ${
        arg.description
      }`
  );

  return [definition, body, ...argumentDefinitions].join("\n");
}

export const abilitiesPromptContent = (players: Player[]) => {
  const playerNameList = players.map((p) => `"${p.name}"`).join(", ");

  const lines = [
    `As well as sending text to the players, you also have the ability to ` +
      `use several actions to add to the experience. An action is made up of an ` +
      `action name, followed by arguments delimited by | characters, ` +
      `all surrounded by curly braces, like so:`,
    `{ActionName|argument1|argument2}`,
    ``,

    `You have the following actions available to you:`,

    abilityDescriptor({
      name: actionNameEnum.Values.DrawCharacter,
      description: "Generates an image of a character for the players to see.",
      parameters: [{ name: "Visual Description", description: "" }],
    }),
    abilityDescriptor({
      name: actionNameEnum.Values.DrawScene,
      description: "Generates an image of a scene for the players to see.",
      parameters: [{ name: "Visual Description", description: "" }],
    }),
    abilityDescriptor({
      name: actionNameEnum.Values.GiveItem,
      description:
        "Adds an item to a player's inventory. You should call this whenever a player receives an item.",
      parameters: [
        {
          name: "CharacterName",
          description:
            `The full name of the character receiving the item. ` +
            `Must be one one of the following: ${playerNameList}.`,
        },
        {
          name: "ItemName",
          description: `A short name of the item given, like "Short Sword" or "A Golden Key"`,
        },
        {
          name: "ItemDescription",
          description: "A one sentence description of the item.",
        },
        {
          name: "Quantity",
          optional: true,
          description:
            "The number of that item to give. If this argument is not passed, it will default to 1.",
        },
      ],
    }),
    abilityDescriptor({
      name: actionNameEnum.Values.RemoveItem,
      description:
        "Removes an item to a player's inventory. You should call this whenever a player loses or uses up an item.",
      parameters: [
        {
          name: "CharacterName",
          description:
            `The full name of the character receiving the item. ` +
            `Must be one one of the following: ${playerNameList}.`,
        },
        {
          name: "ItemName",
          description: `The name of the item to take away. `,
        },
        {
          name: "Quantity",
          optional: true,
          description:
            "The number of that item to remove. If this argument is not passed, it will remove ALL of that item from the character's inventory.",
        },
      ],
    }),
  ];
  return lines.join("\n");
};
