import fs from "node:fs";
import {
  flownarioInputs,
  generateCombinations,
  validate
} from "./flownarios.js";

const filename = "flownarioData";
const backupPath = "scripts/backup";
const sourceFilePath = `scripts/${filename}.js`;
const destinationFilePath = `${backupPath}/${filename}_${new Date().toISOString()}`;

// Check if the source file exists
fs.access(sourceFilePath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`Source file does not exist: ${sourceFilePath}`);
    return;
  }

  // If the source file exists, read its content and write it to the destination file
  fs.readFile(sourceFilePath, "utf8", (readErr, data) => {
    if (readErr) {
      console.error(`Error reading source file: ${readErr.message}`);
      return;
    }
    if (!fs.existsSync(backupPath)) {
      fs.mkdir(backupPath);
    }
    // Write the content to the destination file
    fs.writeFile(destinationFilePath, data, "utf8", (writeErr) => {
      if (writeErr) {
        console.error(`Error writing to destination file: ${writeErr.message}`);
        return;
      }
  
      console.log(`File copied from ${sourceFilePath} to ${destinationFilePath}`);
    });
  });  
});

/**
 * Given a set of inputs, generates combinations of flownarios and writes results to flownariodata.js
 */
const combinations = generateCombinations(...flownarioInputs);
let hashSet = new Set();

const validCombinations = combinations.filter((entry) => {
  if (hashSet.has(entry.hash)) {
    throw new Error(`Duplicate hash detected: ${entry.hash}`);
  }

  if (validate(entry)) {
    return entry;
  }
});

fs.writeFileSync(
  sourceFilePath,
  `const scenarios = ${JSON.stringify(
    validCombinations,
    null,
    2
  )};\nexport default scenarios;`
);
