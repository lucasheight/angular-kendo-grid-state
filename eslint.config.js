// @ts-check
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tseslint.config(
  {
    ignores: ["dist/**", ".angular/**", "coverage/**", "node_modules/**"],
  },
  {
    files: ["**/*.ts"],
    extends: [...angular.configs.tsRecommended, prettierRecommended],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: ["tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-inferrable-types": 0,
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
