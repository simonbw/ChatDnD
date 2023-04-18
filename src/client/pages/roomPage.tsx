import React from "react";
import { Footer } from "../components/Footer";
import { RoomPageContent } from "../components/RoomPageContent";
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
        <RoomPageContent />
      </Paper>
      <Footer />
    </RoomProvider>
  </PlayerContextProvider>
);
