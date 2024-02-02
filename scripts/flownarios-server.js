import fs from "node:fs";
import { flownarioConstants, flownarioInputs } from "./flownarios-client.js";

const backupFlownarioData = (postfix) => {
  postfix = `${postfix}_${new Date().toISOString()}`;
  const filename = getFilename();
  // Check if the source file exists
  fs.access(flownarioConstants.DATA_FILE, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        `Source file does not exist: ${flownarioConstants.DATA_FILE}`
      );
      return;
    }

    // If the source file exists, read its content and write it to the destination file
    fs.readFile(flownarioConstants.DATA_FILE, "utf8", (readErr, data) => {
      if (readErr) {
        console.error(`Error reading source file: ${readErr.message}`);
        return;
      }
      if (!fs.existsSync(flownarioConstants.BACKUP_PATH)) {
        fs.mkdir(flownarioConstants.BACKUP_PATH);
      }
      const destinationFilePath = `${flownarioConstants.BACKUP_PATH}/${filename}_${postfix}.js`;
      // Write the content to the destination file
      fs.writeFile(destinationFilePath, data, "utf8", (writeErr) => {
        if (writeErr) {
          console.error(
            `Error writing to destination file: ${writeErr.message}`
          );
          return;
        }

        console.log(
          `File copied from ${flownarioConstants.DATA_FILE} to ${destinationFilePath}`
        );
      });
    });
  });
};

const generateCombinations = (...objects) => {
  // Helper function to generate combinations recursively
  function generate(currentCombination, remainingObjects) {
    if (remainingObjects.length === 0) {
      const hash = simpleHash(Object.values(currentCombination).join(", "));
      // If no more objects to process, create a  hash and add the current combination to the result
      const hashedCombination = {
        ...currentCombination,
        hash: hash,
        pkgV1DeployedState: {
          activeVersion: "",
          apiVersion: "",
          description: "",
          status: "",
          totalVersions: ""
        },
        customerChangesState: {
          activeVersion: "",
          apiVersion: "",
          description: "",
          status: "",
          totalVersions: ""
        },
        pkgV2DeployedState: {
          activeVersion: "",
          apiVersion: "",
          description: "",
          status: "",
          totalVersions: ""
        },
        flowName: `flownarios_${result.length}_${hash}`
      };
      if (validate(hashedCombination)) result.push(hashedCombination);
      return;
    }

    const currentObject = remainingObjects[0];
    const key = Object.keys(currentObject)[0];
    const values = currentObject[key];

    // Iterate through the values of the current object and generate combinations
    for (let i = 0; i < values.length; i++) {
      const newCombination = { ...currentCombination, [key]: values[i] };
      const newRemainingObjects = [...remainingObjects.slice(1)];
      generate(newCombination, newRemainingObjects);
    }
  }

  // Result array to store all combinations
  const result = [];

  // Start the recursion with an empty combination and all input objects
  generate({}, objects);

  return result;
};

const getFilename = () => {
  const regex = /(?<=scripts\/)\w+/;
  const resultArray = regex.exec(flownarioConstants.DATA_FILE);
  if (resultArray === null) {
    throw new Error(
      `Filename could not be parsed: ${flownarioConstants.DATA_FILE}`
    );
  } else {
    return resultArray[0];
  }
};


// https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

const validate = (scenarioObj) => {
  if (
    scenarioObj.v1TempOver !== flownarioConstants.OVERRIDEABLE &&
    scenarioObj.ccOverride.includes("overrides")
  ) {
    return false;
  }
  if (
    flownarioConstants.INACTIVE_REGEX.test(scenarioObj.v1State) &&
    flownarioConstants.INACTIVE_REGEX.test(scenarioObj.ccState)
  ) {
    return false;
  }
  if (
    flownarioConstants.ACTIVE_REGEX.test(scenarioObj.v1State) &&
    flownarioConstants.ACTIVE_REGEX.test(scenarioObj.ccState)
  ) {
    return false;
  }

  return true;
};

const writeFlownarioData = (data) => {
  fs.writeFileSync(
    flownarioConstants.DATA_FILE,
    `const scenarios = ${JSON.stringify(
      data,
      null,
      2
    )};\nexport default scenarios;`
  );
};

export {
  simpleHash,
  validate,
  generateCombinations,
  writeFlownarioData,
  backupFlownarioData
};
