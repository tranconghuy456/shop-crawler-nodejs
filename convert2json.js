import * as fs from "fs";
import { Parser } from "json2csv";

fs.readFile("./Nem-Van-Thanh_Woocommerce.json", "utf8", function (err, data) {
  if (err) throw err;
  //   console.log(JSON.parse(data));
  data = JSON.parse(data);
  var parser = new Parser({
    fields: ["products"],
    excelStrings: true,
    withBOM: true,
  });

  const csv = parser.parse(data);

  fs.appendFile("Nem-van-thanh-2.csv", csv, "utf8", function (error, result) {
    console.log("Nem-van-thanh-2.csv -> OK");
  });
});
