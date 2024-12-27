/** @type {import("eslint").Linter.Config} */
export default [
  {
    name: "Common config",
    rules: {
      "no-unused-vars": "error",
      "indent": ["error", 2, {SwitchCase: 1}],
      "arrow-parens": ["error", "always"]
    }
  },
  {
    ignores: ["dist"]
  }
];
