import { resolve } from "node:path";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vite";

const projectRoot = import.meta.dirname;

// Every page is an HTML file at the project root, and each is a Vite entry point.
const PAGES = ["index", "room", "test"];

// Room URLs are `/room/{roomId}`. Must match the rewrite in vercel.json.
const ROOM_PATH = /^\/room\/[^/]+\/?$/;

/**
 * Mirror Vercel's routing in the dev/preview servers: clean URLs
 * (`/test` → `test.html`) and `/room/{id}` → `room.html`.
 */
function vercelRouting(): Plugin {
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const [path, query] = (req.url ?? "/").split("?");
    const name = path.replace(/^\/|\/$/g, "");
    let target: string | null = null;
    if (PAGES.includes(name)) {
      target = `/${name}.html`;
    } else if (ROOM_PATH.test(path)) {
      target = "/room.html";
    }
    if (target) {
      req.url = target + (query ? `?${query}` : "");
    }
    next();
  };
  return {
    name: "chatdnd-vercel-routing",
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

export default defineConfig({
  plugins: [vercelRouting()],
  esbuild: {
    // Classic JSX runtime (components import React explicitly).
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        PAGES.map((p) => [p, resolve(projectRoot, `${p}.html`)])
      ),
    },
  },
  server: { port: 3000 },
  preview: { port: 3000 },
});
