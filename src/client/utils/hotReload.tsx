export function registerEsbuildHotReload() {
  // Live reload (only in dev)
  if (process?.env?.NODE_ENV == "development") {
    try {
      const source = new EventSource("/esbuild");
      source.addEventListener("change", () => {
        console.log("out of date");
        location.reload();
      });
      source.addEventListener("connection-error", (event) =>
        console.warn("esbuild event stream error:", event.data)
      );

      console.log("hot reload enabled");
    } catch (error) {
      console.warn("failed to start esbuild listener", error);
    }
  }
}
