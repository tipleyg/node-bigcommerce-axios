import AxiosBcConnection from './AxiosBcConnection.js';
import { getArrayDataFromCSV, getParentSkuByVariantSku } from './utils.js';

async function deleteProductVariants({ getProductIdBySKU, getProductVariantByProdId, deleteProductVariant }, variantSkus) {

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

async function deleteVariantsBySku() {    
    const aceCatalogBcConnection = new AxiosBcConnection(),
        filename = process.argv[2] || "csv.csv",
        variantSkus = await getArrayDataFromCSV(filename);
    
    if (!variantSkus) throw Error("import missing content!");
    
    await deleteProductVariants(aceCatalogBcConnection, variantSkus);
}

await deleteVariantsBySku();