import axios from "axios";
import { Router } from "express";
import https from "https";
import http from "http";
import { Readable } from "stream";

const router = Router();
export default router;

// Trust self-signed certificates for local development
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const httpAgent = new http.Agent({});

router.get("/esbuild", async (req, res) => {
  try {
    // Set up Server-Sent Events headers
    res.header({
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });
    res.flushHeaders();

    // Request the event stream from the provided URL
    const axiosRes = await axios.get<Readable>("http://0.0.0.0:8000/esbuild", {
      headers: { Accept: "text/event-stream" },
      responseType: "stream",
      httpsAgent,
    });

    // Forward events from the response stream to the client
    axiosRes.data.on("data", (chunk: any) => {
      res.write(chunk);
    });

    // Close the connection when the client disconnects
    req.on("close", () => {
      axiosRes.data.destroy();
      res.end();
    });
  } catch (error) {
    console.error("Error while forwarding events:", error);
    res.write("event: connection-error\n" + "data: " + error + "\n\n");
    res.end();
  }
});
