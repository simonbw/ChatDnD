import React from "react";
import { Footer } from "../components/Footer";
import { Paper } from "../components/Paper";
import { RoomPageContent } from "../components/RoomPageContent";
import { PlayerContextProvider } from "../contexts/playerContext";
import { RoomProvider } from "../hooks/useRoomState";
import { renderPage } from "../utils/renderPage";

renderPage(
  <PlayerContextProvider>
    <RoomProvider>
      <Paper>
        <RoomPageContent />
      </Paper>
      <Footer />
    </RoomProvider>
  </PlayerContextProvider>
);
