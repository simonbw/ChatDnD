import axios from "axios";
import { Router } from "express";
import https from "https";
import { Readable } from "stream";
import { routes } from "../../common/routes";
import { startEventStream } from "../utils/eventStreamUtils";

const router = Router();
export default router;

// Trust self-signed certificates for local development
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

router.get(routes.esbuild(), async (req, res) => {
  console.log("Forwarding http://0.0.0.0:8000/esbuild to /esbuild");
  try {
    startEventStream(res);

    // Request the event stream from the provided URL
    const axiosRes = await axios.get<Readable>("http://0.0.0.0:8000/esbuild", {
      headers: { Accept: "text/event-stream" },
      responseType: "stream",
      httpsAgent,
    });

    // Forward events from the response stream to the client
    axiosRes.data.on("data", (chunk: unknown) => {
      console.log("esbuild server sent data");
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
