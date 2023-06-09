import express from "express";
import { getDb } from "./db";
import { errorHandler } from "./middleware/errorHandler";
import esbuildRouter from "./middleware/esbuildRouter";
import generationApiRouter from "./middleware/generationApiRouter";
import { getStaticsMiddleware } from "./middleware/getStaticsMiddleware";
import homeRouter from "./middleware/homeRouter";
import miscDebugRouter from "./middleware/miscDebugRouter";
import roomRouter from "./middleware/room/roomRouter";
import voiceRouter from "./middleware/voiceRouter";
import { RoomStore } from "./room/roomStore";

export async function makeApp() {
  // Initialize database connection
  await getDb();

  // Initialize room store before serving traffic
  await RoomStore.instance.initialize();

  const app = express();

  // Body Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.text());

  // Static files
  app.use("/static", getStaticsMiddleware());

  // Routes
  app.use(homeRouter);
  app.use(miscDebugRouter);
  app.use(esbuildRouter);
  app.use(voiceRouter);
  app.use(roomRouter);
  app.use(generationApiRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}
