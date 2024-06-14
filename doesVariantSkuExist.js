import axios from 'axios';
import * as fs from 'fs';

function getConfig() {
    //see config.json format below:
    /*{
        "xAuthToken": "xxxx",
        "storeHash": "xxxx"
    }*/

    try {
        const configText = fs.readFileSync("config.json");
        
        if (!configText) return;
        
        return JSON.parse(configText);
    } catch (e) {
        console.error(e);
    }
}

function initAxiosHeaders(xAuthToken) {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['X-Auth-Token'] = xAuthToken;
}

async function getArrayDataFromCSV(fileName) {
    try {
        const csvText = fs.readFileSync(fileName, 'utf8');
        
        if (!csvText) return;
        
        return dedupeArray(csvText.split("\n"));
    } catch (e) {
        console.error(e);
    }
}

function dedupeArray(arr) {
    return Array.from(new Set(arr));
}

async function checkForProductVariants(config, variantSkus) {
    const baseUrl = `https://api.bigcommerce.com/stores/${config.storeHash}/v3/catalog/products`;
    
    const getParentSkuByVariantSku = sku => {
        try {
            if (!sku.includes("-")) throw "SKU in unexpected format";

            return sku.split("-")[0];    //this client's parent SKUs are known to be contained in variant SKUs before their first '-'
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
            console.error("getProductIdBySKU");//error);
        }
    }

    async function getProductVariantByProdId(productId, sku) {
        try {
            const response = await axios.get(`${baseUrl}/${productId}/variants?sku=${sku}&include_fields=sku`),
                variant = response.data.data[0];
            
            return variant?.id;
        } catch (error) {
            console.error("getProductVariantByProdId");//error);
        }
    }

    const remainingSkus = [];

    for (const variantSku of variantSkus) {
        const parentSku = getParentSkuByVariantSku(variantSku),
            productId = await getProductIdBySKU(parentSku),
            variantId = await getProductVariantByProdId(productId, variantSku);

        if (!!variantId) {
            console.log(`variantSku:${variantSku}`);
            remainingSkus.push(variantSku);
            continue;
        }
    }

    fs.writeFileSync("./remainingSkusToBeManuallyDeleted.csv", remainingSkus.join("\n"));
}

export default async function bcApiConnect() {    
    const { xAuthToken, storeHash } = getConfig(),
        variantSkus = await getArrayDataFromCSV("hoistsDeleteVariantSkus.csv");

    initAxiosHeaders(xAuthToken);
    
    await checkForProductVariants(storeHash, variantSkus);
}

await bcApiConnect();