import { Router } from "express";
import { generateCharacterRequestBody } from "../../common/api-schemas/generationApiSchemas";
import { characterClassEnum } from "../../common/models/characterClassEnum";
import { Character } from "../../common/models/characterModel";
import { characterRaceEnum } from "../../common/models/characterRaceEnum";
import { pronounsEnum } from "../../common/models/pronouns";
import { routes } from "../../common/routes";
import { choose } from "../../common/utils/randUtils";
import { DrawingStyle } from "../image-generation/DrawingStyle";
import { generateImage } from "../image-generation/generateImage";
import { generatePortraitImage } from "../image-generation/generateImageTypes";
import {
  generateBackgroundMessage,
  generateDescriptionMessage,
  generateNameMessage,
  generatePortraitMessage,
} from "../prompts/characterGenerationPrompts";
import { cleanupChatResponse, simpleTextResponse } from "../utils/openAiUtils";
import { validateRequestBody } from "./zodMiddleware";

const router = Router();
export default router;

router.post(
  routes.generate.character.character(),
  validateRequestBody(generateCharacterRequestBody),
  async (req, res) => {
    const character: Partial<Character> = {};
    character.pronouns = choose(...pronounsEnum.options);
    character.race = choose(...characterRaceEnum.options);
    character.characterClass = choose(...characterClassEnum.options);

    character.name = await simpleTextResponse(generateNameMessage(character), {
      temperature: 1,
    });

    character.background = await simpleTextResponse(
      generateBackgroundMessage(character),
      {
        temperature: 1,
      }
    );

    character.description = await simpleTextResponse(
      generateDescriptionMessage(character),
      {
        temperature: 1,
      }
    );

    character.portrait = {
      caption: cleanupChatResponse(
        await simpleTextResponse(generatePortraitMessage(req.body), {
          temperature: 1,
        })
      ),
      url: "",
    };

    character.portrait.url = await generateImage(character.portrait.caption, {
      drawingStyle: DrawingStyle.CharacterPortrait,
      s3Folder: "character-portraits",
    });

    res.send(character);
  }
);

router.post(
  routes.generate.character.name(),
  validateRequestBody(generateCharacterRequestBody),
  async (req, res) => {
    const name = await simpleTextResponse(generateNameMessage(req.body), {
      temperature: 1,
    });
    res.send({ name });
  }
);

router.post(
  routes.generate.character.background(),
  validateRequestBody(generateCharacterRequestBody),
  async (req, res) => {
    const background = await simpleTextResponse(
      generateBackgroundMessage(req.body),
      { temperature: 1 }
    );
    res.send({ background });
  }
);

router.post(
  routes.generate.character.description(),
  validateRequestBody(generateCharacterRequestBody),
  async (req, res) => {
    const description = await simpleTextResponse(
      generateDescriptionMessage(req.body),
      { temperature: 1 }
    );
    res.send({ description });
  }
);

router.post(
  routes.generate.character.portrait(),
  validateRequestBody(generateCharacterRequestBody),
  async (req, res) => {
    let caption = req.body.portrait?.caption;
    if (!caption) {
      console.log("Getting portrait prompt...");
      const adjectives = cleanupChatResponse(
        await simpleTextResponse(generatePortraitMessage(req.body), {
          temperature: 0.5,
        }),
        { singlePhrase: true, stripQuotes: true }
      );

      caption = `A ${req.body.race} ${req.body.characterClass}. ${adjectives}`;
    }

    res.send({
      portrait: {
        caption,
        url: await generatePortraitImage(caption),
      },
    });
  }
);
