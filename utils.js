import * as fs from 'fs';

export async function getArrayDataFromCSV(fileName) {
    try {
        const csvText = fs.readFileSync(fileName, 'utf8');
        
        if (!csvText) return;
        
        return dedupeArray(csvText.split("\n").map(str => str.trim()));
    } catch (e) {
        console.error(e);
    }
}

export function dedupeArray(arr) {
    return Array.from(new Set(arr));
}

export function getParentSkuByVariantSku(sku) {
    try {
        if (!sku.includes("-")) throw "SKU in unexpected format";

        return sku.split("-")[0];    //this client's parent SKUs are known to be contained in variant SKUs before their first '-'
    } catch(e) {
        console.error(e);
    }
}