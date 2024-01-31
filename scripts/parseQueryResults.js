import process from "node:process";
import fs from "node:fs";
import scenarios from "./flownarioData.js";
import { backupFlownarioData, writeFlownarioData } from "./flownarios-server.js";

function getPathAndState(input) {
  if (input === undefined ) {
    throw new Error("You must pass a valid argument. Valid values are: v1, cc, v2");
  } 
  if (input === "v1") {
    return {path:"scripts/packageV1.json", stateKey: "pkgV1DeployedState"}
  } else if (input === "cc") {
    return {path:"scripts/customer.json", stateKey: "customerChangesState"}
  } else if (input === "v2") {
    return {path:"scripts/packageV2.json", stateKey: "pkgV2DeployedState"}
  } else {
    throw new Error("You must pass a valid argument. Valid values are: v1, cc, v2");
  }
}


const {path, stateKey} = getPathAndState(process.argv[2]);

// read in the file and convert it to a map for easier processing
const queryResults = JSON.parse(fs.readFileSync(path, 'utf-8'));
// const queryResultMap = new Map(queryResults.result.records.map(obj => [obj.Label, obj]));
const queryResultMap = queryResults.result.records.reduce((result, obj) => {
  const label = obj.Label;

  // If the label is already a key in the Map, append the object to the existing array
  if (result.has(label)) {
    result.get(label).push(obj);
  } else {
    // If the label is not a key in the Map, create a new array with the object
    result.set(label, [obj]);
  }

  return result;
}, new Map());

// backup contents of flownarioData.js just in case
backupFlownarioData("stateKey");

// loop the scenarios and write back contents from query results
const updatedScenarios = scenarios.map(scenario => {
  const flowVersionRecords = queryResultMap.get(scenario.flowName);
  if (flowVersionRecords === undefined) {
    scenario[stateKey].description = "Flow version record not found for this flow. It may not have been deployed."
    return scenario;
  }
  for (const i in flowVersionRecords) {
    const record = flowVersionRecords[i];
    if (record["FlowDefinitionView.ActiveVersionId"] === "") {
      scenario[stateKey].activeVersion = "";
      break;
    } else if (record.Status === "Active") {
      scenario[stateKey].activeVersion = record.VersionNumber;
      break;
    }
  }

  const newestRecord = flowVersionRecords[flowVersionRecords.length - 1];
  scenario[stateKey].apiVersion = newestRecord.ApiVersion; // you want this from the specific version
  scenario[stateKey].description = newestRecord.Description; // from the flowversion
  scenario[stateKey].status = newestRecord.Status; // is the current version active
  scenario[stateKey].totalVersions = flowVersionRecords.length; // this should be the latest version in the org
  return scenario;
});

writeFlownarioData(updatedScenarios);
