// ----- Woocommerce Crawler ----- //
// -----  v.1.0 by HuyPaul   ----- //
// This script is only for https://nemvanthanh.vn //

import * as fs from "fs";
import { Parser } from "json2csv";
import * as cheerio from "cheerio";
import axios from "axios";

var products = [];
var categories = [];
var baseURL = "https://nemvanthanh.vn";
var allProducts_URL = `${baseURL}/san-pham`;

// woo csv template, json structure
var wooCSV = {
  type: "",
  sku: "",
  name: "",
  short_description: "",
  description: "",
  regular_price: "Liên hệ",
  categories: "",
  images: "",
  grouped_products: "",
  attribute_1_name: "",
  attribute_1_values: "",
  attribute_2_name: "",
  attribute_2_values: "",
  attribute_3_name: "",
  attribute_3_values: "",
  maintance: "",
};

// Step 1: Category fetcher
const fetchCategory = async () => {
  try {
    // request
    const { data, status } = await axios.get(allProducts_URL);

    // throw if data null
    if (!data || status !== 200) throw status;

    // init cheerio with responsed data
    const $ = cheerio.load(data);

    // get category list -> array
    var category_list = $(
      ".category-products #acf_custom_category-2 > ul .item"
    ).toArray();

    // loop each category in list
    for (let category of category_list) {
      // push to list
      categories.push({
        category_title: $(category).find("a").text().trim(),
        category_href: $(category).find("a").attr("href"),
      });
    }
  } catch (error) {
    throw error;
  }
};

// Step 2: Fetch all products in category
const fetchProductByCategory = async () => {
  try {
    // loop each category
    for (let category of categories) {
      // request;
      const { data, status } = await axios.get(`${category["category_href"]}`);

      // throw if data null
      if (!data || !status === 200) throw status;

      // init cheerio
      const $ = cheerio.load(data);

      // prepare data before fetching
      var preFetch = $(".category-products")
        .find(".list-product .product-item")
        .toArray()
        .filter((product) => {
          if (!$(product).find(".link-product > .name").text()) return false; // undefined
          return true; // defined
        }); // filter all products have name

      // if preFect is true
      if (preFetch) {
        // loop each product in preFetch data
        for (let product of preFetch) {
          console.log(`---> Fetching ${category["category_title"]} ...`);

          // push to products
          products.push({
            category: category["category_title"],
            products: await wooStructer({
              // call wooStructure
              product_href: $(product).find(".link-product").attr("href"),
              product_regular_price:
                `${$(product)
                  .find(
                    ".link-product > .info > .price > .woocommerce-Price-amount"
                  ) // amount
                  .text()} ${$(product)
                  .find(
                    ".link-product > .info > .price > .woocommerce-Price-currencySymbol" // currency
                  )
                  .text()}` || "Liên hệ",
              category: category["category_title"],
            }),
          });
        }
      }
    }
    return products;
  } catch (error) {
    throw error;
  }
};

// wooStructurer for building product data
const wooStructer = async ({
  product_href,
  product_regular_price,
  category,
}) => {
  var product_arr = [];
  // fetch product info
  const { data, status } = await axios.get(product_href);

  // if error
  if (!data || !status === 200) throw status;

  // init cheerio
  const $ = cheerio.load(data);

  // get product info element
  var product_info = $(".decover-product .info-product");

  // get product variations
  var product_variations = JSON.parse(
    $(product_info)
      .find("form.variations_form")
      .attr("data-product_variations") || false
  );

  // get breadcrumb
  var breadcrumb =
    $(".breadcrumb .woocommerce-breadcrumb > span > span")
      .text()
      .substr(
        0,
        $(".breadcrumb .woocommerce-breadcrumb > span > span")
          .text()
          .lastIndexOf("/")
      ) || "Chưa phân loại";

  // if variation is available
  if (product_variations) {
    // loop each variation in product variations
    for (let variation of product_variations) {
      console.log(
        `+ Fetching ${$(".main-background-page .component-heading .title")
          .text()
          .trim()} ...`
      );
      // push to product_arr
      product_arr.push({
        type: "variation",
        sku:
          variation?.sku ||
          $(".description-product .parameter > ul > li:nth-child(1) .right")
            .text()
            .trim() ||
          "#PRODUCT",
        name:
          $(".main-background-page .component-heading .title").text().trim() ||
          "Đang cập nhật",
        description:
          $(".component-inner-middle").html() || "Không có mô tả nào.",
        regular_price: variation?.display_regular_price || "Liên hệ",
        categories: breadcrumb,
        images:
          $(".slider-product-top li.item img")
            .toArray()
            .map((img) => {
              return $(img).attr("src");
            })
            .toString() || "Đang cập nhật",
        grouped_products:
          variation?.sku ||
          $(".description-product .parameter > ul > li:nth-child(1) .right")
            .text()
            .trim() ||
          "#PRODUCT",
        attribute_1_name: Object.keys(variation?.attributes)[0] || "",
        attribute_1_values:
          variation?.attributes[Object.keys(variation?.attributes)[0]] || "",
        attribute_2_name: Object.keys(variation?.attributes)[1] || "",
        attribute_2_values:
          variation?.attributes[Object.keys(variation?.attributes)[1]] || "",
        attribute_3_name: Object.keys(variation?.attributes)[2] || "",
        attribute_3_values:
          variation?.attributes[Object.keys(variation?.attributes)[3]] || "",
      });
    }
  } else {
    // if product has none of variation
    console.log(
      `+ Fetching ${$(".main-background-page .component-heading .title")
        .text()
        .trim()} (none of variation) ...`
    );

    var sku =
      $(".description-product .parameter > ul > li:nth-child(1) .right")
        .text()
        .trim() || "#PRODUCT";
    var price =
      $(".default-price.price > .woocommerce-Price-amount.amount")
        .text()
        .trim() || "Liên hệ";

    product_arr.push({
      type: "variation",
      sku,
      name:
        $(".main-background-page .component-heading .title").text().trim() ||
        "Đang cập nhật",
      description: $(".component-inner-middle").html() || "Không có mô tả nào.",
      regular_price: price,
      categories: breadcrumb,
      images:
        $(".slider-product-top li.item img")
          .toArray()
          .map((img) => {
            return $(img).attr("src");
          })
          .toString() || "Đang cập nhật",
      grouped_products: sku,
      attribute_1_name: "",
      attribute_1_values: "",
      attribute_2_name: "",
      attribute_2_values: "",
      attribute_3_name: "",
      attribute_3_values: "",
    });
  }
  return product_arr;
};

console.log("-> Preparing ...");
fetchCategory().then((categories) => {
  // fetch category
  console.log("-> Fetching product ...");
  fetchProductByCategory(categories).then((products) => {
    // fetch product each category
    console.log("+ All is fetched! \n-> Exporting to JSON file ...");

    // convert object -> json
    var json = JSON.stringify(products);
    // export json file
    fs.writeFile("Nem-Van-Thanh_Woocommerce.json", json, "utf8", (error) => {
      if (error) throw error; // if error

      console.log(
        "+ Nem-Van-Thanh_Woocommerce.json -> OK\n-> Converting to .csv file ..."
      );

      // convert json -> object (parsed)
      json = JSON.parse(json);

      // json2csv options
      var parser = new Parser({
        excelStrings: true,
        withBOM: true,
      });

      // loop each product in json
      for (var product of json) {
        // parse product before convert to csv
        const csv = parser.parse(product["products"]);

        // append new data to file
        fs.appendFile(
          "Nem-Van-Thanh_Woocommerce.csv",
          csv,
          "utf8",
          function (error, result) {
            if (error) throw error; // if error

            console.log("+ Nem-Van-Thanh_Woocommerce.csv -> OK");
          }
        );
      }
    });
  });
});
