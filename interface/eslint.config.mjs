import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      ...pluginJs.configs.recommended.rules, // Use recommended JavaScript rules
      ...pluginReact.configs.flat.recommended.rules, // Use recommended React rules
    },
  },
];
