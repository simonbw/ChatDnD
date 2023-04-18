import express from "express";
import esbuildRouter from "./middleware/esbuildRouter";
import { getStaticsMiddleware } from "./middleware/getStaticsMiddleware";
import homeRouter from "./middleware/homeRouter";
import roomRouter from "./middleware/roomRouter";
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

// Error Handling
// app.use;
