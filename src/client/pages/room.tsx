import React from "react";
import { Button } from "../components/Button";
import { MessagePane } from "../components/MessagePane";
import { SendBox } from "../components/SendBox";
import { renderPage } from "./renderPage";

renderPage(
  <div>
    <nav className="dark p-2 bg-gray-700 border-b-gray-500 border-b">
      <a href="/">
        <Button color="white" kind="outline">
          Home
        </Button>
      </a>
    </nav>

    <div className="container max-w-2xl mx-auto bg-gray-200  rounded overflow-hidden shadow-lg mt-4">
      <MessagePane />
    </div>
    <div className="container max-w-2xl mx-auto bg-gray-200  rounded p-2 shadow-lg mt-4">
      <SendBox />
    </div>
  </div>
);
