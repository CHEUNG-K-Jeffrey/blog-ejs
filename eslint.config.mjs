import "eslint-plugin-only-warn";
import globals from "globals";
import js from "@eslint/js";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"] },
  { languageOptions: { globals: globals.node } },
  js.configs.recommended,
  { rules: {} },
];
