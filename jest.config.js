const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  preset: "ts-jest",

  moduleNameMapper: {
    // Use import paths as defined in tsconfig.json
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  },

  // Only look for test files in these directories
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],
};
