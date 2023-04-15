import express from "express";
import esbuildRouter from "./routers/esbuildRouter";
import homeRouter from "./routers/homeRouter";
import roomRouter from "./routers/roomRouter";
import voiceRouter from "./routers/voiceRouter";
import { getStaticsMiddleware } from "./getStaticsMiddleware";

export const app = express();

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());

// Static files
app.use("/static", getStaticsMiddleware());

// Routes
app.use("/", homeRouter);
app.use("/", esbuildRouter);
app.use("/", voiceRouter);
app.use("/room", roomRouter);
