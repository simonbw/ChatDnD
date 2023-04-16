import "../styles/index.css";

import React from "react";
import { Button } from "../components/Button";
import { MessagePane } from "../components/MessagePane";
import { classNames } from "../components/classNames";
import { renderPage } from "../utils/renderPage";

renderPage(
  <div>
    <nav className="text-zinc-100">
      <a href="/">
        <Button color="white" kind="text">
          Home
        </Button>
      </a>
    </nav>

    <div className="px-4 animate-grow-in duration">
      <div
        className={classNames(
          "container max-w-5xl mx-auto overflow-hidden mt-4 p-8 xl:p-12",
          "ragged-edges shadow-xl bg-sepia-200"
        )}
        style={{
          backgroundImage: "url(/static/images/parchment-3.jpg)",
          backgroundSize: "auto",
          backgroundRepeat: "repeat",
        }}
      >
        <MessagePane />
      </div>
    </div>
  </div>
);
