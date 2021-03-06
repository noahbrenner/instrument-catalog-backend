// Some inspiration from:
// https://github.com/iamturns/create-exposed-app/blob/master/.eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    sourceType: "module",
  },

  env: {
    node: true,
    es2020: true, // Modern syntax features and global objects
  },

  extends: [
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
  ],

  plugins: ["@typescript-eslint"],

  settings: {
    "import/resolver": {
      typescript: {}, // Use <root>/tsconfig.json
    },
  },

  rules: {
    // Allow class properties to be grouped together
    "lines-between-class-members": [
      "error",
      "always",
      { exceptAfterSingleLine: true },
    ],

    // `console` isn't a problem on the server
    "no-console": "off",

    // Allow ForOfStatement (banned by eslint-config-airbnb-base)
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],

    // Be explicit when an import is only used as a type
    "@typescript-eslint/consistent-type-imports": ["error"],

    // Allow unused function parameters if they start with an underscore
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "all", argsIgnorePattern: "^_" },
    ],

    // Use TypeScript-aware implementation of this built-in rule
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],

    // Don't use file extensions when importing modules
    // https://github.com/benmosher/eslint-plugin-import/issues/1615
    "import/extensions": ["error", "ignorePackages", { ts: "never" }],

    // Use named exports: explicit, consistent, and easier for tooling
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",

    // Allow importing devDependencies in buid and test files
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["*.js", "src/**/*.test.ts", "tests/**/*.ts"] },
    ],
  },

  overrides: [
    {
      // We need to use require() in plain JS files
      files: ["**/*.js"],
      rules: { "@typescript-eslint/no-var-requires": "off" },
    },
  ],
};
