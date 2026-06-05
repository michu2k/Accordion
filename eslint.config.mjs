import eslintTs from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...eslintTs.configs.recommended,
  {
    name: "Common config",
    rules: {
      "indent": ["error", 2, { SwitchCase: 1 }],
      "@typescript-eslint/triple-slash-reference": "off"
    }
  },
  {
    ignores: ["dist"]
  }
];
