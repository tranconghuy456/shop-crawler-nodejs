import axios from "axios";
import * as cheerio from "cheerio";

const fetchCategory = async (baseURL) => {
  try {
    // call axios
    const { data, status } = await axios.get(baseURL);

    // not found
    if (!data && !$) throw status;

    const $ = cheerio.load(data);

    // selectors
    var category_list = $(
      ".category-products .list-category .category-item"
    ).toArray();
    var category_data = [];

    for (var category_item of category_list) {
      category_data.push({
        title: $(category_item).find(".title").text(),
        link: $(category_item).find(".wrap-info > a").attr("href") || null,
        //products: await fetchProductByCategory(category_item),
        products: await fetchProductByCategory(
          category_data,
          $(category_item).find(".wrap-info > a").attr("href") || null
        ),
      });

      console.log(`-> ${$(category_item).find(".title").text()} -> Fetched`);
    }

    return category_data;
  } catch (error) {
    throw new Error(error);
  }
};

// const fetchProductByCategory = async (categoryItem) => {
//   try {
//     // null
//     if (!categoryItem) throw null;

//     // selectors
//     var $ = cheerio.load(categoryItem);

//     return $(categoryItem)
//       .find(".list-products > .product-item")
//       .toArray()
//       .filter((product) => {
//         if (!$(product).find(".link-product > .name").text()) return false; // undefined
//         return true; // defined
//       })
//       .map((product) => {
//         return {
//           name: $(product).find(".link-product > .name").text(),
//           regular_price: `${$(product)
//             .find(".link-product > .info > .price > .woocommerce-Price-amount") // amount
//             .text()} ${$(product)
//             .find(
//               ".link-product > .info > .price > .woocommerce-Price-currencySymbol" // currency
//             )
//             .text()}`,
//           image: $(product).find(".product-inner-bottom .img").attr("src"),
//           link: $(product).find(".link-product").attr("href"),
//         };
//       });
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const fetchProductByCategory = async (category_data, link) => {
  try {
    // null
    if (!category_data || !link) throw null;

    var { data, status } = await axios.get(link);
    if (!data) throw status;

    // selectors
    var $ = cheerio.load(data);

    return $(".category-products")
      .find(".list-product .product-item")
      .toArray()
      .filter((product) => {
        if (!$(product).find(".link-product > .name").text()) return false; // undefined
        return true; // defined
      })
      .map((product) => {
        return {
          name: $(product).find(".link-product > .name").text(),
          regular_price: `${$(product)
            .find(".link-product > .info > .price > .woocommerce-Price-amount") // amount
            .text()} ${$(product)
            .find(
              ".link-product > .info > .price > .woocommerce-Price-currencySymbol" // currency
            )
            .text()}`,
          image: $(product).find(".product-inner-bottom .img").attr("src"),
          link: $(product).find(".link-product").attr("href"),
        };
      });
  } catch (error) {
    throw new Error(error);
  }
};

export { fetchCategory, fetchProductByCategory };
