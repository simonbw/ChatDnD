import React from "react";
import { renderPage } from "../utils/renderPage";
import { RoomList } from "./RoomList";

renderPage(
  <main className="container mx-auto p-2">
    <h1 className="text-6xl font-cambridge">ChatDnD</h1>
    <p>This is the home page.</p>
    <RoomList />
  </main>
);
