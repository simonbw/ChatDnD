import React, { useRef } from "react";
import { routes } from "../../common/routes";
import { CharacterPane } from "../components/CharacterPane";
import { Footer } from "../components/Footer";
import { MessagesPane } from "../components/MessagesPane";
import { Paper, PaperContainer } from "../components/Paper";
import { CaretLeft, CaretRight } from "../components/icons/carets";
import { PlayerContextProvider } from "../contexts/playerIdContext";
import { RoomProvider } from "../contexts/roomContext";
import { renderPage } from "../utils/renderPage";

renderPage(<RoomPage />);

function RoomPage() {
  const messagePaperRef = useRef<HTMLDivElement | null>(null);
  const characterPaperRef = useRef<HTMLDivElement | null>(null);
  return (
    <PlayerContextProvider>
      <RoomProvider>
        <PaperContainer>
          <Paper id="MessagesPaper" ref={messagePaperRef}>
            <div className="mb-2 flex justify-between items-start">
              <a className="link" href={routes.home()}>
                <CaretLeft /> Home
              </a>
              <button
                className="link lg:hidden"
                onClick={() => {
                  characterPaperRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Character <CaretRight />
              </button>
            </div>
            <MessagesPane />
          </Paper>
          <Paper className="sticky" id="CharacterPaper" ref={characterPaperRef}>
            <div className="mb-2 flex justify-between items-start">
              <button
                className="link lg:hidden"
                onClick={() => {
                  messagePaperRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <CaretLeft /> Story
              </button>
            </div>
            <CharacterPane />
          </Paper>
        </PaperContainer>
        <Footer />
      </RoomProvider>
    </PlayerContextProvider>
  );
}
