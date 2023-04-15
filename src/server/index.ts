import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { getPort } from "./utils/envUtils";

// Serve in dev mode
const port = getPort();
app.listen(port, () => {
  console.log(
    `ChatDnD Server listening on port ${port}`,
    "node_env:",
    process.env.NODE_ENV
  );
});
