const fs = require("fs");
const { parse } = require("csv-parse");

let count = 0;

fs.createReadStream("scripts/data.csv")
  .pipe(
    parse({
      delimiter: ",",
      ltrim: true,
    })
  )
  .on("data", function (row) {
    
    const hash = row[3].substring(0,7);
    const description = `Pkg v1: ${row[0]}\nCust Changes: ${row[1]}\nPkg v2: ${row[2]}\n${hash}`;
    const status = row[0].includes("inactive") ? "Draft" : "Active";
    const newFlowFileName = `force-app/main/default/flows/${hash}.flow-meta.xml`;
    fs.copyFileSync("scripts/flowTemplate.xml", newFlowFileName);
    let newFile = fs.readFileSync(newFlowFileName, 'utf-8' );
   
    let update = newFile.replace(/{{NAME}}/g,hash);
    update = update.replace(/{{DESCRIPTION}}/g,description);
    update = update.replace(/{{STATUS}}/g,status);
   
    fs.writeFileSync(newFlowFileName, update);
    count++;
    
  })
  .on("error", function (error) {
    console.log(error.message);
  })
  .on("end", function () {
    // Here log the result array
    console.log(`Created ${count} flows`);
  });

