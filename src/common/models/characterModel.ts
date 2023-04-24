import { z } from "zod";
import { pronounsEnum } from "./pronouns";

export const characterRaceEnum = z.enum(["Human", "Elf", "Dwarf", "Halfling"]);
export type CharacterRace = z.infer<typeof characterRaceEnum>;

export const characterClassEnum = z.enum([
  "Fighter",
  "Ranger",
  "Rogue",
  "Cleric",
  "Mage",
]);
export type CharacterClass = z.infer<typeof characterClassEnum>;

export const characterSchema = z.object({
  name: z.string(),
  pronouns: pronounsEnum,
  race: characterRaceEnum,
  characterClass: characterClassEnum,
  description: z.string(),
  background: z.string(),
  portrait: z
    .object({
      caption: z.string(),
      url: z.string(),
    })
    .optional(),
});
export type Character = z.infer<typeof characterSchema>;

export const characterRaceDescrptions = {
  [characterRaceEnum.Values.Human]:
    "Humans are the most diverse and adaptable of all races, and can be found in practically every corner of the world. They typically live short lives compared to some of the other races, but make up for it with resilience and ambition.",
  [characterRaceEnum.Values.Elf]:
    "Elves are long-lived and graceful, with a deep connection to magic. They have a keen intellect and an appreciation for beauty and art.",
  [characterRaceEnum.Values.Dwarf]:
    "Dwarves are hardy and tough, with a natural affinity for mining and craftsmanship. They have a deep love of treasure and ale, and tend to be fiercely loyal to their friends.",
  [characterRaceEnum.Values.Halfling]:
    "Halflings (also known as hobbits) are small and nimble, with an innate sense of luck. They are often carefree and friendly, but can be surprisingly brave when the situation calls for it.",
};

export const characterClassDescrptions = {
  [characterClassEnum.Values.Fighter]:
    "Fighters are skilled warriors who practice a wide range of combat techniques and can master a variety of weapons and armor.",
  [characterClassEnum.Values.Ranger]:
    "Rangers are skilled hunters and trackers, at home in the wilderness and able to unleash a devastating barrage of ranged attacks.",
  [characterClassEnum.Values.Rogue]:
    "Rogues are cunning and resourceful thieves, able to sneak past guards, disarm traps, and strike with deadly precision from the shadows.",
  [characterClassEnum.Values.Cleric]:
    "Clerics are devout servants of a deity, wielding divine magic to heal the wounded, protect the innocent, and smite the wicked.",
  [characterClassEnum.Values.Mage]:
    "Mages study spells and their many uses in order to cast them to great effect. Mages are often scholars and researchers, and may come from a variety of backgrounds.",
};
