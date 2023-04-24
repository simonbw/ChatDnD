import express, { ErrorRequestHandler } from "express";
import esbuildRouter from "./middleware/esbuildRouter";
import { getStaticsMiddleware } from "./middleware/getStaticsMiddleware";
import helpersRouter from "./middleware/generationApiRouter";
import homeRouter from "./middleware/homeRouter";
import roomRouter from "./middleware/room/roomRouter";
import voiceRouter from "./middleware/voiceRouter";
import { errorHtml } from "./pages/errorHtml";

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

app.use(((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  }
  res.send(errorHtml(error));
}) as ErrorRequestHandler);

// Error Handling
// app.use;

process.on("unhandledRejection", (error: Error) => {
  console.warn("unhandledRejection!", error.message);
  // process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.warn("uncaughtException!", error.message);
  // process.exit(1);
});
