import * as fs from 'fs';

export async function getArrayDataFromCSV(fileName) {
    try {
        const csvText = fs.readFileSync(fileName, 'utf8');
        
        if (!csvText) return null;
        
        return dedupeArray(convertStringToArrayTrimmed(csvText));
    } catch (e) {
        console.error(e);
    }
}

export function convertStringToArrayTrimmed(string) {
    return string.split("\n").map(str => str.trim());
}

export function dedupeArray(arr) {
    return Array.from(new Set(arr));
}

export function splitCsvRows(rows) {
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

export function getParentSkuByVariantSku(sku) {
    try {
        if (!sku.includes("-")) throw "SKU in unexpected format";

        return sku.split("-")[0];    //this client's parent SKUs are known to be contained in variant SKUs before their first '-'
    } catch(e) {
        console.error(e);
    }
}