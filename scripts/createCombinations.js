import {
  backupFlownarioData,
  generateCombinations,
  validate,
  writeFlownarioData
} from "./flownarios-server.js";
import { flownarioInputs } from "./flownarios-client.js";


backupFlownarioData("createCombinations")

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

writeFlownarioData(validCombinations);
