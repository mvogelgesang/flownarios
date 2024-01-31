import fs from "node:fs";
import scenarios from "./flownarioData.js";
import {getDescription, flownarioConstants} from "./flownarios-client.js"

const screenFlowRegex = /<screens>\s*(.*?)\s*<\/screens>\s*<start>\s*(.*?)\s*<\/start>/s;
const recordTriggeredFlowRegex = /<recordUpdates>\s*(.*?)\s*<\/recordUpdates>\s*<start>\s*(.*?)\s*<\/start>/s;

const inputVarRegex = new RegExp(
/\s+<variables>/.source
+ /\s+<description>this is an input<\/description>/.source
+ /\s+<name>inputA<\/name>/.source
+ /\s+<dataType>String<\/dataType>/.source
+ /\s+<isCollection>false<\/isCollection>/.source
+ /\s+<isInput>true<\/isInput>/.source
+ /\s+<isOutput>false<\/isOutput>/.source
+ /\s+<value>/.source
+ /\s+<stringValue><\/stringValue>/.source
+ /\s+<\/value>/.source
+ /\s+<\/variables>/.source
);
const outputVarRegex = new RegExp(
/\s+<variables>/.source
+ /\s+<description>this is an output<\/description>/.source
+ /\s+<name>outputA<\/name>/.source
+ /\s+<dataType>String<\/dataType>/.source
+ /\s+<isCollection>false<\/isCollection>/.source
+ /\s+<isInput>false<\/isInput>/.source
+ /\s+<isOutput>true<\/isOutput>/.source
+ /\s+<value>/.source
+ /\s+<stringValue><\/stringValue>/.source
+ /\s+<\/value>/.source
+ /\s+<\/variables>/.source
)
let count = 0;

for (const scenario of scenarios) {
  
  const newFlowFilePath = `force-app/main/default/flows/${scenario.flowName}.flow-meta.xml`;
  fs.copyFileSync("scripts/flowTemplate.xml", newFlowFilePath);

  let newFile = fs.readFileSync(newFlowFilePath, 'utf-8' );
   
  let description = getDescription(scenario);
  description = description.replace(/&/,"&amp;");

  const status = scenario.v1State;
  const type = scenario.v1Type.toLowerCase().includes("screen") ? "Flow" : "AutoLaunchedFlow";
  const overrideable = scenario.v1TempOver.toLowerCase().includes("overrideable");
  const template = scenario.v1TempOver.toLowerCase().includes("template");

  let update = newFile.replace(/{{FLOW_NAME}}/g,scenario.flowName);
  update = update.replace(/{{API_VERSION}}/g, flownarioConstants.API_VERSION)
  update = update.replace(/{{DESCRIPTION}}/g,description);
  update = update.replace(/{{STATUS}}/g,status);
  update = update.replace(/{{FLOW_TYPE}}/g,type);
  if (type === "Flow") {
    update = update.replace(recordTriggeredFlowRegex,"")
  }
  if (type === "AutoLaunchedFlow") {
    update = update.replace(screenFlowRegex,"")
  }

  // clear out overrideable & template metadata if flow isn't of those
  if (!overrideable) {
    update = update.replace(/<isOverridable>true<\/isOverridable>/g,"");
  }
  if (!template) {
    update = update.replace(/<isTemplate>true<\/isTemplate>/g,"");
  }

  fs.writeFileSync(newFlowFilePath, update);
  count++;
}
