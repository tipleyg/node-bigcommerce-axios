import * as fs from 'fs';
import AxiosBcConnection from './AxiosBcConnection.js';
import { getArrayDataFromCSV, getParentSkuByVariantSku } from './utils.js';

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