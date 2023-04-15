import express, { RequestHandler } from "express";
import expressHttpProxy from "express-http-proxy";
import { getNodeEnv, getStaticsFolder } from "./utils/envUtils";

// Determine the right strategy for static files depending on if we're in dev mode or not
export function getStaticsMiddleware() {
  if (getNodeEnv() == "production") {
    const staticFolder = getStaticsFolder();
    console.log(`serving static files from ${staticFolder} at /static`);
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

    return wrappedProxyMiddleware;
  }
}
