import * as fs from 'fs';
import AxiosBcConnection from './AxiosBcConnection.js'

async function getArrayDataFromCSV(fileName) {
    try {
        const csvText = fs.readFileSync(fileName, 'utf8');
        
        if (!csvText) return;
        
        return dedupeArray(csvText.split("\n").map(str => str.trim()));
    } catch (e) {
        console.error(e);
    }
}

function dedupeArray(arr) {
    return Array.from(new Set(arr));
}

function getParentSkuByVariantSku(sku) {
    try {
        if (!sku.includes("-")) throw "SKU in unexpected format";

        return sku.split("-")[0];    //this client's parent SKUs are known to be contained in variant SKUs before their first '-'
    } catch(e) {
        console.error(e);
    }
}

async function checkForProductVariants({ getProductIdBySKU, getProductVariantByProdId }, variantSkus) {
    const remainingSkus = [];

    for (const variantSku of variantSkus) {
        const parentSku = getParentSkuByVariantSku(variantSku),
            productId = await getProductIdBySKU(parentSku),
            variantId = await getProductVariantByProdId(productId, variantSku);

        if (variantId) {
            console.log(`variantSku found in store:${variantSku}`);
            remainingSkus.push(variantSku);
            continue;
        }
    }

    fs.writeFileSync("./remainingSkusToBeManuallyDeleted.csv", remainingSkus.join("\n"));
}

async function doesVariantSkuExist() {    
    const aceCatalogBcConnection = new AxiosBcConnection(),
        variantSkus = await getArrayDataFromCSV("csv.csv");//hoistsDeleteVariantSkus.csv"); 
    
    await checkForProductVariants(aceCatalogBcConnection, variantSkus);
}

await doesVariantSkuExist();