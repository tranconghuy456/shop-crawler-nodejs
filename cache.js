$(function () {
  showVariantSelection(product_config);

  Config.config_no_attribute(product_config);

  Config.buildConfigTable(product_config.variant_list);
});

const Config = (function () {
  let Config_Target = "#js-config-container";

  // Cấu hình KHÔNG thuộc tính
  function config_no_attribute(data) {
    if (data.attributes == "" && data.variant_list != "") {
      var config_list = [];

      data.variant_list.forEach(function (item) {
        var market_price =
          item.extend.market_price.includes("u") === true
            ? ""
            : item.extend.market_price;
        var market_price_discount =
          item.extend.market_price_discount.includes("u") === true
            ? ""
            : item.extend.market_price_discount;

        config_list.push(`
                        <a href="javascript:void(0)" class="js-config-item item-config" onclick="Config.changeConfigInfo('${item.id}' ,'${market_price}', '${item.sale_price}', '${market_price_discount}', '${item.sku}', this)">
                            ${item.sku}
                        </a>
                    `);
      });

      var html = `
                    <div class="pd-config-group">
                        <p class="group-title">Kích thước</p>
                        <div class="config-group-holder"> ${config_list.join(
                          ""
                        )} </div>
                    </div>
                `;

      $(Config_Target).html(html);

      $(".js-config-item:first-child").click();
    }
  }

  // Đổi giá theo cấu hình
  function changeConfigInfo(
    variant_id,
    marketprice,
    price,
    market_price_discount,
    sku,
    target
  ) {
    $("#js-variant-selected-id").val(variant_id);

    $(".js-config-item").removeClass("current");
    $(target).addClass("current");

    $("#js-config-marketPrice").html(marketprice + "đ");
    $("#js-config-price").html(formatCurrency(price) + "đ");

    if (marketprice > price) {
      if (market_price_discount != "") {
        var discount =
          market_price_discount.includes("%") === true
            ? market_price_discount
            : market_price_discount + "%";
      } else {
        var format_marketprice = marketprice.replaceAll(".", "");
        var discount =
          Math.ceil(100 - (price * 100) / format_marketprice) + "%";
      }

      $("#js-config-discount").html(`(-${discount})`).show();
    } else {
      $("#js-config-discount").hide();
    }

    var url_tragop = "/dem-bong-ep-everon-extrafoam.html".replace(".html", "");
    $(".js-buttonTragop").attr(
      "href",
      url_tragop +
        "/p" +
        PRODUCT_ID +
        "/tra-gop?price=" +
        price +
        "&label=" +
        sku
    );
  }

  // Bảng giá sản phẩm
  function buildConfigTable(variant_list) {
    if (variant_list != "") {
      var target = "#tbl-list-price tbody";
      var html = [];

      variant_list.forEach(function (item, key) {
        var product_id = item.product_id;
        var variant_id = item.id;
        var market_price =
          item.extend.market_price.includes("u") === true
            ? ""
            : formatCurrency(item.extend.market_price.replaceAll(".", ""));
        var price =
          item.sale_price > 0 ? formatCurrency(item.sale_price) : "Liên hệ";

        html.push(`
                        <tr class="itemConfig js-itemConfig" data-product_id="${product_id}" data-variant_id="${variant_id}">
                            <td class="col2">${key + 1}</td>
                            <td class="col1">${item.label}</td>
                            <td class="col2">${item.sku}</td>
                            <td class="col3">${market_price}</td>
                            <td class="col4">${price}</td>
                            <td class="col5">
                                <input type="text" class="tbl_number" value="0" id="js-quantity-variant${variant_id}">
                            </td>
                            <td class="col6">
                                <a href="javascript:void(0);" data-id="${product_id}" class="btn btn-info"
                                 onclick="addVariantToCart(${product_id},${variant_id},$('#js-quantity-variant${variant_id}').val())">Đặt</a>
                            </td>
                        </tr>
                    `);
      });

      $(target).html(html.join(""));
    }
  }

  return {
    config_no_attribute: config_no_attribute,
    buildConfigTable: buildConfigTable,
    changeConfigInfo: changeConfigInfo,
  };
})();

function showVariantSelection(product_config) {
  var VariantTemplate = {
    //hien thi bang gia theo sl cho sp
    price_table:
      "<table><tr><td class='txt_777' style='width:100px;'>Giá<p class='txt_777 space10px'>Số lợưng <br/> sản phẩm</p></td>{{list_price}}</tr></table>",
    //tung gia theo so luong, nam trong price_table
    price_per_quantity:
      "<td><span class='quantity-price-{{price_raw}} txt_b txt_red txt_20'>{{price}}</span><p class='txt_14 space10px'>{{quantity_range}}</p></td>",
    //neu khong co gia theo so luong thi hien thi chung
    price_all: `<td><span class='price_all quantity-price-{{price}} txt_b txt_red txt_20'>{{price}}</span><p class='txt_14 space10px'>{{quantity_range}}</p></td>`,
    //tung thuoc tinh de click chon
    attribute_value:
      "<a href='javascript:void(0)' data-attr='{{ }}' data-value='{{value}}' class='attr-value value-attribute item-config'>{{label}}</a>",
    attribute_row: `
                <div class="pd-config-group">
                    <p class="group-title">{{attr_label}}</p>
                    <div class="config-group-holder" id='attr-{{attr_key}}'> {{row_values}} </div>
                </div>
            `,
    //thuoc tinh cuoi de hien thi danh sach can chon
    last_attribute_row:
      "<div class='d-row config-normal'><div class='name'>{{attr_label}}</div><div class='value'><table>{{value_list}}</table></div></div>",
    last_attribute_value: `<tr><td class='txt_b item-attr-value' data-value='{{label}}'><span class="text">{{label}}</span></td><td class='variant-price'>{{sale_price}}</td><td>{{sku}}</td><td class='none'>(SL : {{stock_quantity}})</td><td><div class='unit-detail-amount-control' onclick="">
            <a href='javascript:;' onclick="$('.obj-list.none').show();" class='change-quantity amount-down' data-operation='decrement'>-</a>
            <input type='text' size='3' value='1' class='amount-input input-quantity-{{item_id}}' data-item_id='{{item_id}}' data-stock_quantity='{{stock_quantity}}' onchange="$('.obj-list.none').show();">
            <a href='javascript:;' onclick="$('.obj-list.none').show();" class='change-quantity amount-up' data-operation='increment'>+</a></div></td></tr>`,
    //tom tat sp da duoc chon
    select_summary: `
                <div class="list-total" data-fanli="false">
                    <p class="amount"><span class="value">{{total_item}}</span><span class="unit">chiếc</span></p>
                    <p class="price"><span class="value">{{total_value}}</span><span class="price-unit">đ</span></p>
                </div>
                <div class="list-selected" style="z-index: 108;">
                    <a rel="nofollow" trace="offerdetail_click_itemlist" href="javascript:;" class="link-list txt_000" data-spm-anchor-id=""><span class="link-list-txt ms-yh" onclick="$('.list-info').toggle();">Danh sách chọn <i class="fa fa-angle-up"><em></em><span></span></i></span></a>
                    <div class="list-info">
                        <table class="table-list" style="">
            `,

    select_row: `
                <tr class="last-row" data-name="">
                    <td class="prop">{{label}}</td>
                    <td class="desc"> <ul>{{item_list}}</ul> </td>
                </tr>
            `,

    select_item: `
                <li class="simple" data-sku-config="">
                    <span class="no-control">{{label}}（<em class="value">{{select_quantity}}</em>）<span class="unit">chiếc</span></span>
                </li>
            `,
  };

  //run
  Hura.ProductConfig.setup({
    config_container: "#js-config-container",
    last_attribute_container: "#last-attribute-holder",
    attributes: product_config.attributes,
    variant_list: product_config.variant_list,
    product_info: product_config.product_info,
    Template: VariantTemplate,
    select_variant_callback: _onVariantSelected,
    select_attribute_value_callback: _onAttributeValueSelected,
  });

  Hura.ProductConfig.run();

  //closure
  function _onVariantSelected(variant) {
    console.log("variant = ", variant);
    var market_price =
      variant.extend.market_price.includes("u") === true
        ? ""
        : formatCurrency(variant.extend.market_price.replaceAll(".", "")) + "đ";
    var price =
      variant.sale_price > 0
        ? formatCurrency(variant.sale_price) + "đ"
        : "Liên hệ";
    var discount =
      variant.extend.market_price_discount.includes("u") === true
        ? ""
        : variant.extend.market_price_discount.replaceAll("%", "");
    var discountFormat = parseInt(discount) > 0 ? "(-" + discount + "%)" : "";

    $("#js-variant-selected-id").val(variant.id);
    $("#js-config-marketPrice").html(market_price);
    $("#js-config-price").html(price);
    $("#js-config-discount").html(discountFormat);
  }
}
