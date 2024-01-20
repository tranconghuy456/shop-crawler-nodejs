import axios from "axios";
import * as cheerio from "cheerio";

const fetchProduct = async (productLink) => {
  try {
    const { data, status } = await axios.get(productLink);

    if (!data) throw status;

    const $ = cheerio.load(data);
    var product_info = $(".decover-product .info-product");

    var product_variations = JSON.parse(
      $(product_info)
        .find("form.variations_form")
        .attr("data-product_variations")
    );
    var product_gallery = $(".slider-product-top li.item img")
      .toArray()
      .map((img) => {
        return $(img).attr("src");
      })
      .toString();
    var product_name = $(
      ".main-background-page .component-heading .title"
    ).text();
    var product_description = $(".component-inner-middle").html();
    var product_category = $(".woocommerce-breadcrumb > span").text();

    return await buildCSV(
      product_variations,
      product_gallery,
      product_name,
      product_description,
      product_category
    );
  } catch (error) {
    throw new Error(error);
  }
};

const buildCSV = async (
  product_variations,
  product_gallery,
  product_name,
  product_description,
  product_category
) => {
  //   const reqCols = [
  //     {
  //       "Parent SKU": "",
  //       SKU: "",
  //       Name: "",
  //       Description: "",
  //       "Short description": "",
  //       Published: "",
  //       "Visibility in catalog": "visible",
  //       "Is in stock": true,
  //       "Is purchasable": true,
  //       "Is sold individually": "no",
  //       "Is virtual": false,
  //       "Max quanity": 999,
  //       "Min quanity": 1,
  //       "Price HTML": "",
  //       "Display price": "",
  //       "Display regular price": "",
  //       "Variation is active": true,
  //       "Variation is visible": true,
  //       "Availability HTML": '<p class="stock in-stock">Còn hàng</p>\n',
  //       Categories: "",
  //       Images: "",
  //       "Attribute 1 name": "Chất liệu",
  //       "Attribute 1 value(s)": "",
  //       "Attribute 1 visible": 1,
  //       "Attribute 1 global": 1,
  //       "Attribute 2 name": "Độ dày",
  //       "Attribute 2 value(s)": "",
  //       "Attribute 2 visible": 1,
  //       "Attribute 2 global": 1,
  //       "Attribute 3 name": "Kích thước",
  //       "Attribute 3 value(s)": "",
  //       "Attribute 3 visible": 1,
  //       "Attribute 3 global": 1,
  //     },
  //   ];
  const reqCols = [];

  // variation false
  if (!product_variations) {
    reqCols.push({
      "Attribute 1 value(s)": null,
      "Attribute 2 value(s)": null,
      "Attribute 3 value(s)": null,
      "Parent SKU": "",
      SKU: null,
      Name: product_name,
      Description: product_description,
      Published: 1,
      "Visibility in catalog": "visible",
      "Is in stock": true,
      "Is purchasable": true,
      "Is sold individually": "no",
      "Is virtual": false,
      "Max quanity": 999,
      "Min quanity": 1,
      "Price HTML": null,
      "Display price": null,
      "Display regular price": null,
      "Variation is active": true,
      "Variation is visible": true,
      "Availability HTML": '<p class="stock in-stock">Còn hàng</p>\n',
      Categories: product_category,
      Images: product_gallery,
      "Attribute 1 name": "Chất liệu",
      "Attribute 1 visible": 1,
      "Attribute 1 global": 1,
      "Attribute 2 name": "Độ dày",
      "Attribute 2 visible": 1,
      "Attribute 2 global": 1,
      "Attribute 3 name": "Kích thước",
      "Attribute 3 visible": 1,
      "Attribute 3 global": 1,
    });

    console.log(`+ ${product_name} -> None of variation -> Default`);

    return reqCols;
  }

  // loop variation
  for (var variation of product_variations) {
    reqCols.push({
      "Attribute 1 value(s)": variation?.attributes["attribute_pa_chat-lieu"],
      "Attribute 2 value(s)": variation?.attributes["attribute_pa_do-day"],
      "Attribute 3 value(s)": variation?.attributes["attribute_pa_kich-thuoc"],
      "Parent SKU": "",
      SKU: variation?.sku,
      Name: product_name,
      Description: product_description,
      Published: 1,
      "Visibility in catalog": "visible",
      "Is in stock": true,
      "Is purchasable": true,
      "Is sold individually": "no",
      "Is virtual": false,
      "Max quanity": 999,
      "Min quanity": 1,
      "Price HTML": variation?.price_html,
      "Display price": variation?.display_price,
      "Display regular price": variation?.display_regular_price,
      "Variation is active": true,
      "Variation is visible": true,
      "Availability HTML": '<p class="stock in-stock">Còn hàng</p>\n',
      Categories: product_category,
      Images: product_gallery,
      "Attribute 1 name": "Chất liệu",
      "Attribute 1 visible": 1,
      "Attribute 1 global": 1,
      "Attribute 2 name": "Độ dày",
      "Attribute 2 visible": 1,
      "Attribute 2 global": 1,
      "Attribute 3 name": "Kích thước",
      "Attribute 3 visible": 1,
      "Attribute 3 global": 1,
    });
  }
  console.log(`+ ${product_name} -> Fetched`);

  return reqCols;
};

export { fetchProduct };
