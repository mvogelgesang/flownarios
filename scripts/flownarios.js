import fs from "node:fs";
import scenarios from "./flownarioData.js";

const flownarioConstants = {
  ACTIVE_FLOW: "Active",
  ACTIVE_REGEX: /^(active|activates)/i,
  INACTIVE_FLOW: "Draft",
  INACTIVE_REGEX: /^(draft|deactivates)/i,
  OVERRIDEABLE: "overrideable",
  TEMPLATE: "template",
  SCREEN_FLOW: "screen flow",
  RECORD_TRIGGERED: "record triggered",
  API_VERSION: 58.0,
  SCREEN_METADATA_UPDATE: `<fields>
  <name>displayText</name>
  <fieldText>&lt;p&gt;hello&lt;/p&gt;</fieldText>
  <fieldType>DisplayText</fieldType>
</fields>`,
  RECORD_METADATA_UPDATE:
    "<stringValue>Appy the Bobcat Enterprises Too</stringValue>",
  DATA_FILE: "scripts/flownarioData.js",
  BACKUP_PATH: "scripts/backup"
};

const flownarioInputs = [
  // remove templates and overrideables
  {
    v1State: [flownarioConstants.ACTIVE_FLOW, flownarioConstants.INACTIVE_FLOW]
  },
  {
    v1Type: [
      flownarioConstants.SCREEN_FLOW,
      flownarioConstants.RECORD_TRIGGERED
    ]
  },
  {
    v1TempOver: [
      flownarioConstants.TEMPLATE,
      flownarioConstants.OVERRIDEABLE,
      "none"
    ]
  },
  { ccState: ["activates", "deactivates", "none"] },
  // "overrides - Active adds outputs",  "overrides - Active adds inputs",  "overrides - Active removes outputs",  "overrides - Active removes inputs,  "overrides - Active flow w/ metadata changes","overrides - Inactive flow w/ metadata changes"
  {
    ccOverride: [
      "none",
      "overrides - Active (no other metadata changes)",
      "overrides - Inactive (no other metadata changes)"
    ]
  },
  { v2Metadata: ["change", "no change"] },
  {
    v2State: [flownarioConstants.ACTIVE_FLOW, flownarioConstants.INACTIVE_FLOW]
  },
  /* { v2FlowVersion: ["new", "none"] },*/
  { v2ApiVersion: ["same", "update"] }
];

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

const createFormFields = () => {
  const form = document.getElementById("form");

  for (let i = 1; i <= 3; i++) {
    const col = document.createElement("div");
    col.setAttribute(
      "class",
      "slds-box slds-col slds-size_4-of-12 slds-p-horizontal_small slds-theme_default"
    );
    col.setAttribute("id", `col-${i}`);
    form.append(col);
  }
  const col1 = document.getElementById("col-1");
  col1.innerHTML = '<div class="slds-text-heading_medium">Package v1</div>';
  const col2 = document.getElementById("col-2");
  col2.innerHTML =
    '<div class="slds-text-heading_medium">Customer Changes</div>';
  const col3 = document.getElementById("col-3");
  col3.innerHTML = '<div class="slds-text-heading_medium">Package v2</div>';

  // need to transform the datastructure for parsing into fields
  const flownarioObjects = flownarioInputsAsObject();
  for (const field in flownarioObjects) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("class", "slds-form-element");

    const label = document.createElement("label");
    label.setAttribute("for", field);
    label.setAttribute("class", "slds-form-element__label");
    label.innerText = field;
    wrapperDiv.append(label);

    const innerDiv1 = document.createElement("div");
    innerDiv1.setAttribute("class", "slds-form-element__control");

    const innerDiv2 = document.createElement("div");
    innerDiv2.setAttribute("class", "slds-combobox_container slds-size_small");

    const selectBox = document.createElement("select");
    selectBox.setAttribute("id", field);
    selectBox.setAttribute("name", field);
    selectBox.options[0] = new Option("");
    for (const opt in flownarioObjects[field]) {
      selectBox.options[selectBox.options.length] = new Option(
        flownarioObjects[field][opt]
      );
    }
    selectBox.addEventListener("change", howManyRemain);

    innerDiv2.append(selectBox);
    innerDiv1.append(innerDiv2);
    wrapperDiv.append(innerDiv1);
    if (field.startsWith("v1")) {
      document.getElementById("col-1").append(wrapperDiv);
    } else if (field.startsWith("cc")) {
      document.getElementById("col-2").append(wrapperDiv);
    } else {
      document.getElementById("col-3").append(wrapperDiv);
    }
  }
};

const flownarioInputsAsObject = () => {
  const flownarioObjects = flownarioInputs.reduce((result, currentObject) => {
    // Extract the key (property name) and value from the current object
    const [key, value] = Object.entries(currentObject)[0];

    // Add the key-value pair to the result object
    result[key] = value;

    return result;
  }, {});
  return flownarioObjects;
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

const getDescription = (scenario) => {
  let result = "";
  for (const [key, value] of Object.entries(scenario)) {
    if (!key.startsWith("pkg") && !key.startsWith("customer")) {
      result += `${key}: ${value}\n`;
    }
  }
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

const howManyRemain = () => {
  const inputValues = {};

  document.querySelector("#remaining").classList.remove("slds-theme_warning");
  document.querySelector("#remaining").classList.add("slds-theme_shade");
  // Collect input values dynamically
  for (const [key, val] of Object.entries(flownarioInputsAsObject())) {
    const inputValue = document.getElementById(key).value.trim();
    inputValues[key] = inputValue;
  }

  // Filter array based on input values
  const filteredData = scenarios.filter((item) => {
    return Object.keys(inputValues).every((key) => {
      // Check if input field is not blank before applying filter
      return (
        inputValues[key] === "" ||
        item[key].toString().startsWith(inputValues[key])
      );
    });
  });
  if (filteredData.length == 1) {
    document.getElementById("result").innerText =
      filteredData[0].pkgV2DeployedState + " this is the result!";
    document.getElementById("description").innerText = getDescription(
      filteredData[0]
    );
  } else if (filteredData.length == 0) {
    document.querySelector("#remaining").classList.add("slds-theme_warning");
    document.querySelector("#remaining").classList.remove("slds-theme_shade");
  }
  document.querySelector("#remaining span").innerText =
    `${filteredData.length} scenarios remain`;
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
  flownarioConstants,
  flownarioInputs,
  howManyRemain,
  getDescription,
  createFormFields,
  simpleHash,
  validate,
  generateCombinations,
  writeFlownarioData,
  backupFlownarioData
};
