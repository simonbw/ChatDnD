import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";

// Serve in dev mode
const port = 3000;
app.listen(port, () => {
  console.log(
    `ChatDnD Server listening on port ${port}`,
    "node_env:",
    process.env.NODE_ENV
  );
});
