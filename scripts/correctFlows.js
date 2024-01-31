import fs from "node:fs";
import scenarios from "./flownarioData.js";
import { backupFlownarioData, flownarioConstants } from "./flownarios.js";

// const filteredScenarios = scenarios.filter((entry) => {
//   let match = entry.flowName.match(/_(\d+)_/);
// 
// // Check if there is a match and the extracted number is greater than 100
// if (match && parseInt(match[1]) > 159) {
//   return entry
// }});
// 
// for (const scenario of filteredScenarios) {
//   const flowFileName = `force-app/main/default/flows/${scenario.flowName}.flow-meta.xml`;
// 
//   let flowFile = fs.readFileSync(flowFileName, 'utf-8' );
//   // console.log(`${scenario.flowName}, ${flowFile.match(/<status>(.*?)<\/status>/)[1]}, ${scenario.v1State}`);
//   let update = flowFile.replace(/<status>(.*?)<\/status>/g,"<status>Draft</status>");
//   fs.writeFileSync(flowFileName, update);
// }

backupFlownarioData("stateKey");