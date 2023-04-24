import { z } from "zod";

export const pronounsEnum = z.enum([
  "He/Him",
  "She/Her",
  "They/Them",
  "It/Its",
]);
export type Pronouns = z.infer<typeof pronounsEnum>;

export function subjectivePronoun(pronouns: Pronouns): string {
  switch (pronouns) {
    case "He/Him":
      return "he";
    case "She/Her":
      return "she";
    case "They/Them":
      return "they";
    case "It/Its":
      return "it";
  }
}

export function objectivePronoun(pronouns: Pronouns): string {
  switch (pronouns) {
    case "He/Him":
      return "him";
    case "She/Her":
      return "her";
    case "They/Them":
      return "them";
    case "It/Its":
      return "it";
  }
}

export function possessivePronoun(pronouns: Pronouns): string {
  switch (pronouns) {
    case "He/Him":
      return "his";
    case "She/Her":
      return "her";
    case "They/Them":
      return "their";
    case "It/Its":
      return "its";
  }
}

export function toBe(pronouns: Pronouns): string {
  switch (pronouns) {
    case "He/Him":
      return "is";
    case "She/Her":
      return "is";
    case "They/Them":
      return "are";
    case "It/Its":
      return "is";
  }
}
