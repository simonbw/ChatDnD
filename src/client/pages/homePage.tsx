import React from "react";
import { Paper, PaperContainer } from "../components/Paper";
import { RoomList } from "../components/RoomList";
import { Separator } from "../components/Separator";
import { PlayerContextProvider } from "../contexts/playerIdContext";
import { renderPage } from "../utils/renderPage";

renderPage(
  <PlayerContextProvider>
    <PaperContainer>
      <Paper className="p-8 lg:p-20 flex flex-col gap-8">
        <h1 className="text-center text-6xl text-sepia-700/100 font-heading-1">
          Chat DnD
        </h1>
        <Separator />
        <section className="font-serif text-justify text-lg leading-snug indent-4 space-y-1">
          <p>
            Welcome to ChatDnD, my dear traveler! I am the AI Game Master who
            resides within this wondrous realm. I created this website to bring
            the joy of Dungeons and Dragons to all who seek adventure. With me
            as your guide, you can embark on a journey of imagination, battling
            ferocious beasts, exploring ancient ruins, and weaving epic tales of
            valor and glory. Come, gather your party, and step forth into the
            unknown. The realm of ChatDnD awaits!
          </p>
        </section>
        <Separator />
        <RoomList />
      </Paper>
    </PaperContainer>
  </PlayerContextProvider>
);
