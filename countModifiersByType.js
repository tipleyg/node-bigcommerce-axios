import AxiosBcConnection from './AxiosBcConnection.js';
import * as fs from 'fs';

function filterForModifiers(product) {
    return product.modifiers && product.modifiers.length;
}

async function countModifiersByType() {    
    const catalogBcConnection = new AxiosBcConnection(),
        params = "?include=modifiers&include_fields=id,modifiers",
        response = await catalogBcConnection.getAllProducts(params, filterForModifiers);
    
    console.log(`Products: ${JSON.stringify(response.length)}`);
    fs.writeFileSync("./productModifers.json", JSON.stringify(response, null, 2));
}

await countModifiersByType();