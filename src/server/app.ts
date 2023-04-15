import express, { RequestHandler } from "express";
import expressHttpProxy from "express-http-proxy";
import esbuildRouter from "./routers/esbuildRouter";
import homeRouter from "./routers/homeRouter";
import roomRouter from "./routers/roomRouter";
import voiceRouter from "./routers/voiceRouter";

export const app = express();

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());

// Static files
if (process.env.NODE_ENV == "production") {
  console.log("serving static files");
  app.use("/static", express.static("dist/client"));
} else {
  console.log("proxying static files");
  let proxyMiddleware: RequestHandler;
  try {
    proxyMiddleware = expressHttpProxy("http://127.0.0.1:8000");
  } catch (error) {
    console.error("Failed to create statics proxy", error);
  }

  const wrappedProxyMiddleware: RequestHandler = (req, res, next) => {
    try {
      return proxyMiddleware(req, res, next);
    } catch (error) {
      console.error("Error with statics proxy", error);
    }
  };

  app.use("/static", wrappedProxyMiddleware);
}

// Routes
app.use("/", homeRouter);
app.use("/", esbuildRouter);
app.use("/", voiceRouter);
app.use("/room", roomRouter);
