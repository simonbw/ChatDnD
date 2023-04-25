import React, { useState } from "react";
import Textarea from "react-expanding-textarea";
import z from "zod";
import { makeJsonEndpoint } from "../api/apiUtil";
import { Button } from "../components/Button";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { Paper, PaperContainer } from "../components/Paper";
import { renderPage } from "../utils/renderPage";

renderPage(<DallePage />);

type ImageInfo =
  | {
      status: "loading";
    }
  | {
      status: "loaded";
      url: string;
    }
  | {
      status: "error";
      error: any;
    };

function DallePage() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<ImageInfo[]>([]);

  return (
    <PaperContainer>
      <Paper className="p-8 lg:p-20 flex flex-col gap-8 max-w-4xl w-full">
        <h1 className="text-center text-6xl text-sepia-700/100 font-heading-1">
          Chat DnD
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {images.map((image, i) =>
            image.status === "loading" ? (
              <div>
                <LoadingIndicator />
              </div>
            ) : image.status === "loaded" ? (
              <img src={image.url} key={i} />
            ) : (
              <div className="rounded border-2 border-red">
                Error {JSON.stringify(image.error)}
              </div>
            )
          )}
        </div>

        <div className="w-full max-w-96 flex flex-col gap-2 mx-auto">
          <Textarea
            className="text-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            color="primary"
            onClick={async () => {
              const index = images.length;
              setImages((old) => [...old, { status: "loading" }]);
              try {
                const res = await dalleEndpoint({ prompt });
                setImages((old) => {
                  const r = [...old];
                  r[index] = { status: "loaded", url: res.url };
                  return r;
                });
              } catch (error) {
                setImages((old) => {
                  const r = [...old];
                  r[index] = { status: "error", error: error };
                  return r;
                });
              }
            }}
          >
            Generate
          </Button>
        </div>
      </Paper>
    </PaperContainer>
  );
}

const dalleEndpoint = makeJsonEndpoint(
  "post",
  "/dalle",
  z.object({ prompt: z.string() }),
  z.object({ url: z.string() })
);
