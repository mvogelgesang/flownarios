import fs from "node:fs";
import scenarios from "./flownarioData.js";
import { flownarioConstants } from "./flownarios-client.js";

for (const scenario of scenarios) {
  
  const flowFileName = `force-app/main/default/flows/${scenario.flowName}.flow-meta.xml`;

  let flowFile = fs.readFileSync(flowFileName, 'utf-8' );

  const status = scenario.v2State.toLowerCase().includes("draft") ? "Draft" : "Active";
  
  let update = flowFile.replace(/<status>.*?<\/status>/g, status);
  if (scenario.v2ApiVersion === "update") {
    update = update.replace(/<apiVersion>\d+.0<\/apiVersion>/g, (flownarioConstants.API_VERSION+1).toFixed(1));
  }
  if (scenario.v2Metadata === "change") {
    if (scenario.v1Type === flownarioConstants.SCREEN_FLOW) {
      update = update.replace(/<screens>/g,`<screens>\n${flownarioConstants.SCREEN_METADATA_UPDATE}`);
    } else if (scenario.v1Type === flownarioConstants.RECORD_TRIGGERED) {
      update = update.replace(/Appy the Bobcat Enterprises/g, flownarioConstants.RECORD_METADATA_UPDATE);
    }
  }


  fs.writeFileSync(flowFileName, update);
}
