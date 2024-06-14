import AxiosBcConnection from './AxiosBcConnection.js';
import { getArrayDataFromCSV, splitCsvRows, getParentSkuByVariantSku } from './utils.js';

async function updateProductVariants({ getProductIdBySKU, getProductVariantByProdId, updateProductVariantName }, variantData) {
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

        await updateProductVariantName(productId, variant);
    }
}

async function updateVariantsBySku() {    
    const aceCatalogBcConnection = new AxiosBcConnection(),
        filename = process.argv[2] || "csv2.csv",
        variantData = splitCsvRows(await getArrayDataFromCSV(filename));
    
    if (!variantData || !variantData.length) throw Error("import missing content!");
    
    await updateProductVariants(aceCatalogBcConnection, variantData);
}

await updateVariantsBySku();