const childProcess = require("child_process");

const fs = require("fs-extra");

try {
  // Remove current build
  fs.removeSync("./dist/");

  // Transpile the typescript files
  const proc = childProcess.exec("tsc --build tsconfig.prod.json");
  proc.on("close", (code) => {
    if (code !== 0) {
      throw Error(`Build failed with code ${code}`);
    }
  });
} catch (err) {
  console.log(err);
}
