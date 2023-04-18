import express, { RequestHandler } from "express";
import expressHttpProxy from "express-http-proxy";
import {
  getDrawnImageFolder,
  getNodeEnv,
  getStaticsFolder,
} from "../utils/envUtils";
import fs from "fs/promises";

// Determine the right strategy for static files depending on if we're in dev mode or not
export function getStaticsMiddleware() {
  if (getNodeEnv() == "production") {
    const staticFolder = getStaticsFolder();
    console.log(`serving static files from ${staticFolder} at /static`);

    guaranteeDrawnImageFolder();

    return express.static(staticFolder);
  } else {
    console.log("proxying static files to 127.0.0.1:800");
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

    guaranteeDrawnImageFolder();

    return wrappedProxyMiddleware;
  }
}

async function guaranteeDrawnImageFolder() {
  // Make sure we have somewhere to put
  console.log(`guaranteeing drawn image folder at ${getDrawnImageFolder()}`);
  await fs.mkdir(getDrawnImageFolder(), { recursive: true });
}
