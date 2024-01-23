import { fetchCategory } from "./packages/fetchCategory.js";
import { fetchProduct } from "./packages/fetchProduct.js";
import { Parser } from "json2csv";
import * as fs from "fs";

var product_data = [];

console.log(`---> Running <---`);
fetchCategory("https://nemvanthanh.vn/danh-muc-san-pham/").then(
  async (data) => {
    console.log("Product Category -> Fetched");
    for (var category of data) {
      for (var product of category.products) {
        await fetchProduct(product.link).then((result) => {
          product_data.push(result);
        });
      }
    }

    console.log("All is Fetched -> Start exporting ...");

    if (product_data) {
      var json = JSON.stringify(product_data);

      fs.writeFile("Nem-Van-Thanh_Woocommerce.json", json, "utf8", (error) => {
        if (error) throw new Error(error);
        console.log("File is successfully exported!");
      });
    }
  }
);
