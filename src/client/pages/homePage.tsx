import React from "react";
import { NavBar } from "../components/NavBar";
import { Paper } from "../components/Paper";
import { PlayerContextProvider } from "../contexts/playerContext";
import { renderPage } from "../utils/renderPage";
import { RoomList } from "./RoomList";

renderPage(
  <PlayerContextProvider>
    <NavBar />
    <Paper className="">
      <h1 className="text-center text-6xl text-sepia-700 font-heading-1">
        Chat DnD
      </h1>
      <RoomList />
    </Paper>
  </PlayerContextProvider>
);
