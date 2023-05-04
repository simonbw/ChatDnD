import { z } from "zod";

export const characterClassEnum = z.enum([
  "Fighter",
  "Ranger",
  "Rogue",
  "Cleric",
  "Mage",
]);

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

export type CharacterClass = z.infer<typeof characterClassEnum>;
