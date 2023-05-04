import { z } from "zod";

export const characterRaceEnum = z.enum(["Human", "Elf", "Dwarf", "Halfling"]);
export type CharacterRace = z.infer<typeof characterRaceEnum>;

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
