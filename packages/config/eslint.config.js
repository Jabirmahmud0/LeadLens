export default [
  {
    ignores: ["node_modules", "dist", ".next"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error"
    }
  }
];
