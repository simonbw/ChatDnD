import autoprefixer from "autoprefixer";
import esbuild from "esbuild";
import postcssPlugin from "esbuild-style-plugin";
import fs from "fs/promises";
import postcssImport from "postcss-import";
import tailwind from "tailwindcss";

const isDev = process.argv.some((arg) => arg == "--dev");

const context = await esbuild
  .context({
    entryPoints: [
      "src/client/pages/homePage.tsx",
      "src/client/pages/roomPage.tsx",
      "src/client/styles/index.css",
    ],
    bundle: true,
    minify: !isDev,
    sourcemap: true,
    outdir: "dist/client",
    external: ["/static/fonts/*"],
    plugins: [
      postcssPlugin({
        extract: true,
        postcss: {
          plugins: [postcssImport, tailwind, autoprefixer],
        },
      }),
    ],
  })
  .catch(() => {
    console.error(`Build error: ${error}`);
    process.exit(1);
  });

await copyStatics();

if (isDev) {
  await context.watch();
  const { host, port } = await context
    .serve({ servedir: "dist/client", port: 8000 })
    .catch(() => {
      console.error(`Build error: ${error}`);
      process.exit(1);
    });
  console.log(`esbuild serving on ${host}:${port}`);
} else {
  await context.rebuild();
  await context.dispose();
}

async function copyStatics() {
  const startTime = performance.now();
  const destinationDir = "dist/client";
  await fs.mkdir(destinationDir, { recursive: true });

  console.log(`copying statics to ${destinationDir}`);

  fs.cp("static", destinationDir, { recursive: true });

  console.log(`done [${Math.round(performance.now() - startTime)}ms]`);
}
