import esbuild from "esbuild";

const isDev = process.argv.some((arg) => arg == "--dev");

const context = await esbuild
  .context({
    entryPoints: ["src/server/index.ts"],
    bundle: true,
    minify: !isDev,
    platform: "node",
    sourcemap: true,
    outdir: "dist/server",
    plugins: [],
  })
  .catch(() => {
    console.error(`Build error: ${error}`);
    process.exit(1);
  });

if (isDev) {
  await context.watch().catch(() => {
    console.error(`Build error: ${error}`);
    process.exit(1);
  });
} else {
  await context.rebuild();
  await context.dispose();
}
