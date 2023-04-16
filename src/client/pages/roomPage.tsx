// import "../styles/index.css";

import React from "react";
import { Button } from "../components/Button";
import { MessagePane } from "../components/MessagePane";
import { classNames } from "../components/classNames";
import { renderPage } from "../utils/renderPage";

renderPage(
  <div>
    <nav className="text-zinc-100 container mx-auto max-w-2xl font-serif">
      <a href="/">
        <Button color="white" kind="text">
          Home
        </Button>
      </a>
    </nav>

    <div className="px-4 animate-grow-in duration">
      <div
        className={classNames(
          "container max-w-2xl mx-auto overflow-hidden mt-4 py-8 xl:py-12",
          "shadow-black shadow-2xl bg-sepia-200 drop-shadow-xl"
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
    <footer className="h-8"></footer>
  </div>
);
