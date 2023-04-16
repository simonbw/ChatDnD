import React from "react";
import { renderPage } from "../utils/renderPage";
import { RoomList } from "./RoomList";
import { Paper } from "../components/Paper";
import { Button } from "../components/Button";

renderPage(
  <main className="container mx-auto p-2">
    <Paper className="p-4">
      <FontList />
    </Paper>
  </main>
);

const fonts = [
  "Aluvemskrew",
  "Archking",
  "Bajern",
  "Beautiful Dream",
  "Berkahi Blackletter",
  "Bettackerl",
  "Black Chancery",
  "Blackpride",
  "Browking",
  "Kingthings Calligraphica",
  "Cambridge",
  "Carglos",
  "Denibas sunset",
  "Dungeon",
  "Enchant",
  "Kingthings Exeter",
  "Kingthings Foundation",
  "Gomawo",
  "Gordon",
  "Inkfree",
  "Kingthings Italique",
  "Killuminati",
  "Kingslayer",
  "Lordish",
  "Manstein",
  "Matgard",
  "Kingthings Petrock",
  "Silverback",
  "The Magician",
  "Van Blessing",
];
function FontList() {
  return (
    <div className="text-6xl space-y-2">
      {fonts.map((font) => (
        <div key={font} style={{ fontFamily: font }}>
          Chat DnD — {font}
        </div>
      ))}
    </div>
  );
}
