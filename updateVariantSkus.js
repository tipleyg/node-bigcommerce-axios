import axios from 'axios';
import * as fs from 'fs';

function getConfig() {
    /*{
        "logLevel": "info",
        "clientId": "xxxx",
        "secret": "xxxx",
        "callback": "https://test.test/test",
        "responseType": "json",
        "storeHash": "storeHash",
        "headers": { 
            "Accept-Encoding": "*" 
        },
        "apiVersion": "v3"
    }*/

    try {
        const configText = fs.readFileSync("config.json");
        
        if (!configText) return;
        
        return JSON.parse(configText);
    } catch (e) {
        console.error(e);
    }
}

function initAxiosHeaders(config) {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['X-Auth-Token'] = config["x-auth-token"];
}

async function getArrayDataFromCSV(fileName) {
    function splitCsvRows(rows) {
        let keys;
        const csvData = [];
    
        rows.forEach((row, i) => {
            if (!i) {
                //split header row to make keys
                keys = row.split(',');            
            } else {
                const rowData = {},
                    values = row.split(',');

                //form object from keys and row data
                keys.forEach((key, i) => {
                    rowData[key.trim()] = values[i];
                });

                //push object to csvData;
                csvData.push(rowData);
            }
        });

        return csvData;
    }

    try {
        const csvText = fs.readFileSync(fileName, 'utf8');
        
        if (!csvText) return;

        return splitCsvRows(csvText.split("\n"));
    } catch (e) {
        console.error(e);
    }
}

async function updateProductVariants(config, variantData) {
    const baseUrl = `https://api.bigcommerce.com/stores/${config.storeHash}/v3/catalog/products`;

    const getParentSkuByVariantSku = sku => {
        try {
            if (!sku.includes("-")) throw "SKU in unexpected format";

            return sku.split("-")[0];    //parent SKUs are known to be contained in variant SKUs before their first '-'
        } catch(e) {
            console.error(e);
        }
    };

    async function getProductIdBySKU(sku) {
        try {
            const response = await axios.get(`${baseUrl}/?sku=${sku}&include_fields=`),
                product = response.data.data[0];
    
            return product.id;
        } catch (error) {
            console.error(error);
        }
    }

    async function getProductVariantByProdId(productId, sku) {
        try {
            const response = await axios.get(`${baseUrl}/${productId}/variants?sku=${sku}&include_fields=sku`),
                variant = response.data.data[0];
            
            return variant.id;
        } catch (error) {
            console.error(error);
        }
    }

    async function updateProductVariant(productId, variant) {
        const { variantId } = variant,
            content = {
                sku: variant.sku,
                option_display_name: variant.productName
            };

        try {
            const response = await axios.put(`${baseUrl}/${productId}/variants/${variantId}`, content);

            console.log(`deleted ${productId}/${variantId} status:${response.status}`);
        } catch (error) {
            console.error(error);
        }
    }

    for (const variant of variantData) {
        const variantSku = variant.sku,
            parentSku = getParentSkuByVariantSku(variantSku),
            productId = await getProductIdBySKU(parentSku),
            variantId = await getProductVariantByProdId(productId, variantSku);

        if (!variantId) {
            console.log(`variantId is falsy variantSku:${variantSku} productId:${productId} variantId:${variantId}`);
            continue;
        }

        variant.variantId = variantId;

        await updateProductVariant(productId, variant);
    }
}

(async () => {    
    const variantData = await getArrayDataFromCSV("csv.csv");//"./hoistsDeleteVariantSkus.csv");
    //console.log(JSON.stringify(variantData));
    
    const config = getConfig();
    if (!config || !Object.keys(config).length) throw Error("no config");
    initAxiosHeaders(config);
    
    await updateProductVariants(config, variantData);
})();