import autoprefixer from "autoprefixer";
import esbuild from "esbuild";
import postcssPlugin from "esbuild-postcss";
import tailwind from "tailwindcss";
import postcssImport from "postcss-import";

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
    plugins: [
      postcssPlugin({
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
