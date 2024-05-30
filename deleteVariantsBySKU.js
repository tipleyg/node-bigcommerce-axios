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
    try {
        const csvText = fs.readFileSync(fileName, 'utf8');
        
        if (!csvText) return;
        
        return csvText.split("\n");
    } catch (e) {
        console.error(e);
    }
}

async function deleteProductVariants(config, variantSkus) {
    const baseUrl = `https://api.bigcommerce.com/stores/${config.storeHash}/v3/catalog/products`,
        getParentSkuByVariantSku = sku => sku.split("-")[0];

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

    async function deleteProductVariant(productId, variantId) {
        try {
            const response = await axios.delete(`${baseUrl}/${productId}/variants/${variantId}`);

            console.log(`deleted ${productId}/${variantId} status:${response.status}`);
        } catch (error) {
            console.error(error);
        }
    }

    for (const variantSku of variantSkus) {
        const parentSku = getParentSkuByVariantSku(variantSku),
            productId = await getProductIdBySKU(parentSku),
            variantId = await getProductVariantByProdId(productId, variantSku);

        if (!variantId) {
            console.log(`variantId is falsy variantSku:${variantSku} productId:${productId} variantId:${variantId}`);
            continue;
        }

        await deleteProductVariant(productId, variantId);
    }
}

(async () => {    
    const variantSkus = await getArrayDataFromCSV("csv.csv");//"./hoistsDeleteVariantSKUs.csv");
    
    const config = getConfig();
    if (!config) throw Error("no config");
    initAxiosHeaders(config);
    
    await deleteProductVariants(config, variantSkus);
})();