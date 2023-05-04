import { z } from "zod";

export const pronounsEnum = z.enum([
  "He/Him",
  "She/Her",
  "They/Them",
  "It/Its",
]);
export type Pronouns = z.infer<typeof pronounsEnum>;

export function subjectivePronoun(pronouns: Pronouns, upper = false): string {
  switch (pronouns) {
    case "He/Him":
      return upper ? "He" : "he";
    case "She/Her":
      return upper ? "She" : "she";
    case "They/Them":
      return upper ? "They" : "they";
    case "It/Its":
      return upper ? "It" : "it";
  }
}

export function objectivePronoun(pronouns: Pronouns, upper = false): string {
  switch (pronouns) {
    case "He/Him":
      return upper ? "Him" : "him";
    case "She/Her":
      return upper ? "Her" : "her";
    case "They/Them":
      return upper ? "Them" : "them";
    case "It/Its":
      return upper ? "It" : "it";
  }
}

export function possessivePronoun(pronouns: Pronouns, upper = false): string {
  switch (pronouns) {
    case "He/Him":
      return upper ? "His" : "his";
    case "She/Her":
      return upper ? "Her" : "her";
    case "They/Them":
      return upper ? "Their" : "their";
    case "It/Its":
      return upper ? "Its" : "its";
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
