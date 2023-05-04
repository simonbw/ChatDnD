import { makeApp } from "./app";
import { getPort } from "./utils/envUtils";

// Serve in dev mode
makeApp().then((app) => {
  const port = getPort();
  app.listen(port, () => {
    console.log(
      `ChatDnD Server listening on port ${port}`,
      "node_env:",
      process.env.NODE_ENV
    );
  });
});

process.on("unhandledRejection", (error: Error) => {
  console.warn("unhandledRejection!", error.message);
  console.error(error);
  // process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.warn("uncaughtException!", error.message);
  console.error(error);
  // process.exit(1);
});
