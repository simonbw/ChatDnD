import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import tailwind from "tailwindcss";

export default {
  plugins: [postcssImport, tailwind, autoprefixer],
};
