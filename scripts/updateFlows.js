import fs from "node:fs";
import scenarios from "./flownarioData.js";
import { flownarioConstants } from "./flownarios-client.js";

for (const scenario of scenarios) {
  
  const flowFileName = `force-app/main/default/flows/${scenario.flowName}.flow-meta.xml`;

  let flowFile = fs.readFileSync(flowFileName, 'utf-8' );
  
  // status change
  let update = flowFile.replace(/(<status>)(.*?)(<\/status>)/g, `$1${scenario.v2State}$3`);

  // apiVersion change
  if (scenario.v2ApiVersion === "update") {
    update = update.replace(/(<apiVersion>)(\d+.0)(<\/apiVersion>)/g, `$1${(flownarioConstants.API_VERSION+1).toFixed(1)}$3`);
  }

  // metadata change
  if (scenario.v2Metadata === "change") {
    if (scenario.v1Type === flownarioConstants.SCREEN_FLOW) {
      update = update.replace(/<screens>/g,`<screens>\n${flownarioConstants.SCREEN_METADATA_UPDATE}`);
    } else if (scenario.v1Type === flownarioConstants.RECORD_TRIGGERED) {
      update = update.replace(/Appy the Bobcat Enterprises/g, flownarioConstants.RECORD_METADATA_UPDATE);
    }
  }


  fs.writeFileSync(flowFileName, update);
}
