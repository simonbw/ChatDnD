import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import esbuildRouter from "./middleware/esbuildRouter";
import helpersRouter from "./middleware/generationApiRouter";
import { getStaticsMiddleware } from "./middleware/getStaticsMiddleware";
import homeRouter from "./middleware/homeRouter";
import roomRouter from "./middleware/room/roomRouter";
import voiceRouter from "./middleware/voiceRouter";

export const app = express();

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());

// Static files
app.use("/static", getStaticsMiddleware());

// Routes
app.use(homeRouter);
app.use(esbuildRouter);
app.use(voiceRouter);
app.use(roomRouter);
app.use(helpersRouter);

// Error handling
app.use(errorHandler);

process.on("unhandledRejection", (error: Error) => {
  console.warn("unhandledRejection!", error.message);
  // process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.warn("uncaughtException!", error.message);
  // process.exit(1);
});
