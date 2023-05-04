import React from "react";
import { Footer } from "../components/Footer";
import { Paper, PaperContainer } from "../components/Paper";
import { MessagesPane } from "../components/MessagesPane";
import { PlayerContextProvider } from "../contexts/playerIdContext";
import { RoomProvider } from "../contexts/roomContext";
import { renderPage } from "../utils/renderPage";
import { CharacterPane } from "../components/CharacterPane";

renderPage(
  <PlayerContextProvider>
    <RoomProvider>
      <PaperContainer>
        <Paper>
          <MessagesPane />
        </Paper>
        <Paper className="sticky top-8">
          <CharacterPane />
        </Paper>
      </PaperContainer>
      <Footer />
    </RoomProvider>
  </PlayerContextProvider>
);
