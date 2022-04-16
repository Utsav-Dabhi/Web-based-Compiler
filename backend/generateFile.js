const fs = require("fs");
const path = require("path");

// package to generate uniques ids'
// v4 renamed as uuidv4
const { v4: uuidv4 } = require("uuid");

// we need the directory path for the "codes" folder
// codes are gnerated and saved in "codes" folder
const dirCodes = path.join(__dirname, "codes");

// if the folder does not exist then we create it using fs module
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

// this function creates the file to be executed and further to be runned
const generateFile = async (format, content) => {
  // new jon id generated
  const jobID = uuidv4();

  // file name for the new file generated
  const fileName = `${jobID}.${format}`;

  const filePath = path.join(dirCodes, fileName);

  await fs.writeFileSync(filePath, content);
  return filePath;
};

module.exports = {
  generateFile,
};
