import * as fs from 'fs';

(function main() {
    const products = JSON.parse(fs.readFileSync('./productModifers-product_list_with_images.json', { encoding: "utf-8" })),
    csvArr = products.map(prod => {
        return `"${prod.sku}","${prod.name}","${prod.page_title}","${prod.is_visible}","https://store-xyz.mybigcommerce.com/manage/products/edit/${prod.id}","https://www.xyz.com${prod.custom_url.url}"`;
    });

    csvArr.unshift('"sku","name","page_title","is_visible","dashURL","storeURL"');

    fs.writeFileSync("./picklist_report.csv", csvArr.join("\n"));
})();