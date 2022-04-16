const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// path where outputs will be stored
outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = async (filepath) => {
  // for executing the file we need only the file name
  // so we remove . and the extension
  // eg - 5e31f06b-5ff8-418e-8735-d7ecee78b69e.cpp
  const jobId = path.basename(filepath).split(".")[0];

  // the path where we need to store the executable file
  const outPath = path.join(outputPath, `${jobId}`);

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filepath} -o ${outPath} && cd ${outputPath} && ${jobId}`,
      (error, stdout, stderr) => {
        error && reject({ error, stderr });
        stderr && reject({ stderr });
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeCpp,
};

// executeCpp(filePath);
