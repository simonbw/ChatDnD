import express from "express";
import fs from "fs/promises";
import { getDrawnImageFolder, getStaticsFolder } from "../utils/envUtils";

// Determine the right strategy for static files depending on if we're in dev mode or not
export function getStaticsMiddleware() {
  const staticFolder = getStaticsFolder();
  console.log(
    `[staticsMiddleware] serving static files from ${staticFolder} at /static`
  );
  guaranteeDrawnImageFolder();
  return express.static(staticFolder);
}

async function guaranteeDrawnImageFolder() {
  // Make sure we have somewhere to put
  await fs.mkdir(getDrawnImageFolder(), { recursive: true });
}
