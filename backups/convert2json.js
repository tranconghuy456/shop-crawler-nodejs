import * as fs from "fs";
import { Parser } from "json2csv";

fs.readFile("./Nem-Van-Thanh_Woocommerce.json", "utf8", function (err, data) {
  if (err) throw err;

  // loop each product in json
  // data = JSON.parse(data);
  // data = JSON.parse(data);
  // // console.log(data);
  // // console.log(data);

  // var parser = new Parser({
  //   excelStrings: true,
  //   withBOM: true,
  // });

  // // data = JSON.parse(data);

  // for (var product of data) {
  //   const csv = parser.parse(product["products"]);

  //   fs.appendFile("./Nem-Van-Thanh_Woocommerce.csv", csv, "utf-8", (err) => {
  //     if (err) throw err;
  //   });
  // }

  var result = JSON.parse(data);
  // console.log(result);

  var json = [];

  for (var product of result) {
    // console.log(product["products"]);
    json.push(product["products"]);
  }

  // var parser = new Parser({
  //   excelStrings: true,
  //   withBOM: true,
  // });

  // var csv = parser.parse(json);
  json = JSON.stringify(json);
  fs.writeFile("./Nem-Van-Thanh_Woocommerce2.json", json, "utf-8", (err) => {
    if (err) throw err;
  });

  // console.log(json);
});
