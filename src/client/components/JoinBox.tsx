import React, { useState } from "react";
import Textarea from "react-expanding-textarea";
import { z } from "zod";
import {
  characterClassDescrptions,
  characterClassEnum,
} from "../../common/models/characterClassEnum";
import { Character, characterSchema } from "../../common/models/characterModel";
import {
  characterRaceDescrptions,
  characterRaceEnum,
} from "../../common/models/characterRaceEnum";
import { pronounsEnum } from "../../common/models/pronouns";
import { choose } from "../../common/utils/randUtils";
import {
  generateCharacterBackground,
  generateCharacterDescription,
  generateCharacterPortrait,
} from "../api/generationApiClient";
import { joinRoom } from "../api/roomApiClient";
import { usePlayerId } from "../contexts/playerIdContext";
import { useCachedState } from "../hooks/useCachedState";
import { classNames } from "../utils/classNames";
import { Button } from "./Button";
import { DescriptionSelect } from "./DescriptionSelect";
import { PortraitPicker } from "./PortraitPicker";
import { Select } from "./Select";

type GeneratingMap = {
  [K in keyof Character]: boolean;
};

function makeDefaultCharacter(): Character {
  return {
    background: "",
    characterClass: choose(...characterClassEnum.options),
    name: "",
    description: "",
    pronouns: choose(...pronounsEnum.options),
    race: choose(...characterRaceEnum.options),
    inventory: [],
  };
}

export function JoinBox({
  roomId,
  openToJoin,
}: {
  roomId: string;
  openToJoin: boolean;
}) {
  const playerId = usePlayerId();
  const [playerName, setPlayerName] = useCachedState(
    "playerName",
    z.string(),
    ""
  );
  const [playerPronouns, setPlayerPronouns] = useCachedState(
    "playerPronouns",
    pronounsEnum,
    "He/Him"
  );
  const [character, setCharacter] = useCachedState<Character>(
    "playerCharacter",
    characterSchema,
    makeDefaultCharacter()
  );
  const updateCharacter = (p: Partial<Character>) =>
    setCharacter((c) => ({ ...c, ...p }));

  const [generating, setGenerating] = useState<GeneratingMap>({
    background: false,
    characterClass: false,
    description: false,
    name: false,
    pronouns: false,
    race: false,
    inventory: false,
  });

  const startGeneratingField = (field: keyof GeneratingMap) => {
    setGenerating((g) => ({ ...g, [field]: true }));
  };

  const stopGeneratingField = (field: keyof GeneratingMap) => {
    setGenerating((g) => ({ ...g, [field]: false }));
  };

  if (!openToJoin) {
    return (
      <div className="p-2">
        <p className="text-center italic">
          This campaign is not open to join at the moment.
        </p>
      </div>
    );
  }

  const submit = async () => {
    try {
      await joinRoom(roomId)({
        id: playerId,
        name: playerName,
        pronouns: playerPronouns,
        character,
      });
    } catch (error) {
      console.warn("Failed to join room");
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={classNames(
        "max-w-sm mx-auto",
        "flex flex-col items-stretch gap-2",
        "font-serif py-4"
      )}
    >
      <h1 className="font-heading-2 text-4xl text-center self-center">
        Create Your Character
      </h1>
      <div className="flex flex-row justify-stretch w-full gap-4 border border-sepia/50 rounded-sm p-2">
        <fieldset className="block w-full flex-basis-[200px]">
          <label className="block small-caps" htmlFor="player-name">
            Player Name
          </label>
          <input
            type="text"
            autoComplete="off"
            className={classNames(
              "text-input w-full",
              "font-nametag underline underline-offset-1"
            )}
            required
            autoFocus
            onChange={(e) => setPlayerName(e.target.value)}
            value={playerName}
            id="player-name"
          />
        </fieldset>

        <Select
          label="Pronouns"
          value={playerPronouns}
          onChange={setPlayerPronouns}
          options={pronounsEnum.options.map((o) => ({ value: o }))}
        />
      </div>

      <div className="flex flex-row justify-stretch w-full gap-4">
        <fieldset className="block w-full flex-grow">
          <label className="block small-caps" htmlFor="character-name">
            Character Name
          </label>
          <input
            type="text"
            autoComplete="off"
            className={classNames(
              "text-input w-full flex-grow-0",
              "font-nametag underline underline-offset-1"
            )}
            required
            autoFocus
            onChange={(e) => updateCharacter({ name: e.target.value })}
            value={character.name}
            id="character-name"
          />
        </fieldset>

        <Select
          label="Pronouns"
          value={character.pronouns}
          onChange={(pronouns) => updateCharacter({ pronouns })}
          options={pronounsEnum.options.map((o) => ({ value: o }))}
        />
      </div>

      <DescriptionSelect
        label={"Race"}
        value={character.race}
        onChange={(race) => updateCharacter({ race })}
        options={characterRaceEnum.options.map((c) => ({
          value: c,
          description: characterRaceDescrptions[c],
        }))}
      />

      <DescriptionSelect
        label={"Class"}
        value={character.characterClass}
        onChange={(characterClass) => updateCharacter({ characterClass })}
        options={characterClassEnum.options.map((c) => ({
          value: c,
          description: characterClassDescrptions[c],
        }))}
      />

      <fieldset className="block w-full">
        <label
          className="flex gap-1 items-baseline"
          htmlFor="character-background"
        >
          <span className="small-caps">Background</span>
          <span>—</span>
          <span className="text-xs flex-grow">
            What made your character{" "}
            {character.pronouns == "He/Him"
              ? "who he is"
              : character.pronouns === "She/Her"
              ? "who she is"
              : character.pronouns === "They/Them"
              ? "who they are"
              : "what it is"}{" "}
            today
          </span>
          <Button
            onClick={async (e) => {
              e.preventDefault();
              startGeneratingField("background");
              try {
                updateCharacter(await generateCharacterBackground(character));
              } finally {
                stopGeneratingField("background");
              }
            }}
            type="button"
            className="rounded-full w-8 h-8 mb-[-1em]"
            kind="text"
            loading={generating.background}
          >
            🎲
          </Button>
        </label>
        <Textarea
          className={classNames("text-input w-full text-sm")}
          required
          onChange={(e) => updateCharacter({ background: e.target.value })}
          value={character.background}
          id="character-background"
          disabled={generating.background}
        />
      </fieldset>

      <fieldset className="block w-full">
        <label
          className="flex gap-1 items-baseline"
          htmlFor="character-description"
        >
          <span className="small-caps">Description</span>
          <span>—</span>
          <span className="text-xs flex-grow">Appearance and personality</span>
          <Button
            onClick={async (e) => {
              e.preventDefault();
              startGeneratingField("description");
              try {
                updateCharacter(await generateCharacterDescription(character));
              } finally {
                stopGeneratingField("description");
              }
            }}
            type="button"
            className="rounded-full w-8 h-8 mb-[-1em]"
            kind="text"
            loading={generating.description}
          >
            🎲
          </Button>
        </label>
        <Textarea
          className={classNames("text-input w-full text-sm")}
          required
          onChange={(e) => updateCharacter({ description: e.target.value })}
          value={character.description}
          id="character-description"
          disabled={generating.description}
        />
      </fieldset>

      <div>
        <label className="small-caps">Portrait</label>
        <PortraitPicker
          generating={Boolean(generating.portrait)}
          portrait={character.portrait}
          generate={async (newPrompt: boolean) => {
            startGeneratingField("portrait");
            try {
              if (newPrompt) {
                updateCharacter(
                  await generateCharacterPortrait({
                    ...character,
                    portrait: undefined,
                  })
                );
              } else {
                updateCharacter(await generateCharacterPortrait(character));
              }
            } finally {
              stopGeneratingField("portrait");
            }
          }}
        />
      </div>

      <Button
        kind="flat"
        color="primary"
        type="submit"
        className="self-end mt-4"
      >
        Join Campaign
      </Button>
    </form>
  );
}
