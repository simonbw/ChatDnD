import React from "react";
import { Footer } from "../components/Footer";
import { MessagePane } from "../components/MessagePane";
import { NavBar } from "../components/NavBar";
import { Paper } from "../components/Paper";
import { PlayerContextProvider } from "../contexts/playerContext";
import { RoomProvider } from "../hooks/useRoomState";
import { renderPage } from "../utils/renderPage";

renderPage(
  <PlayerContextProvider>
    <RoomProvider>
      <NavBar />
      <Paper>
        <MessagePane />
      </Paper>
      <Footer />
    </RoomProvider>
  </PlayerContextProvider>
);
