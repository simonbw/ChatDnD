import React from "react";
import { CharacterPane } from "../components/CharacterPane";
import { Footer } from "../components/Footer";
import { MessagesPane } from "../components/MessagesPane";
import { Paper, PaperContainer } from "../components/Paper";
import { PlayerContextProvider } from "../contexts/playerIdContext";
import { RoomProvider } from "../contexts/roomContext";
import { renderPage } from "../utils/renderPage";

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
