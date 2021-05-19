const { pathsToModuleNameMapper } = require("ts-jest/utils");

const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",

  // Run tests in series to prevent database state from affecting the results
  // This is necessary because we reset the database between tests
  maxWorkers: 1,

  moduleNameMapper: {
    // Use import paths as defined in tsconfig.json
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },

  // Only look for test files in these directories
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],

  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],

  testEnvironment: "node",
};
