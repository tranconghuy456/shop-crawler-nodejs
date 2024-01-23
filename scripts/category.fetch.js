import * as fs from "fs";
import * as cheerio from "cheerio";
import axios from "axios";
import * as ENV from "../configs/root.js";
import * as puppeteer from "puppeteer";

const getProductByCategory = async () => {
  try {
    // reqiest
    var request = axios.get(ENV.URLs.BASE_URL).then(({ data, status }) => {
      if (!data || status !== 200) throw status;

      return data;
    });

    var $default = cheerio.load(await request);
    var newElement = $default("body").append("div");
    newElement.html($default.html());
    console.log($default.html());

    var scripts = newElement.find("script");
    // console.log($default);
    for (var i = 0; i < scripts.length; ++i) {
      var script = scripts[i];
      eval($default(script).html());
    }
    // eval($default);

    // console.log($default);
  } catch (error) {
    throw error;
  }
};

getProductByCategory().then((data) => {
  //   console.log(data);
});
