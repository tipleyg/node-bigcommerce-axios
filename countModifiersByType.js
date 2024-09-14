import AxiosBcConnection from './AxiosBcConnection.js';
import * as fs from 'fs';

function filterForModifiers(product) {
    return (product.modifiers 
        && product.modifiers.length 
        && product.modifiers.find(p => {
            return p.type === "product_list_with_images";
        })
    );
}

async function countModifiersByType() {    
    const catalogBcConnection = new AxiosBcConnection(),
        params = "?include=modifiers",
        response = await catalogBcConnection.getAllProducts(params, filterForModifiers);
    
    const results = response.filter(filterForModifiers);

    console.log(`Products: ${JSON.stringify(results.length)}`);
    fs.writeFileSync("./productModifers-product_list_with_images.json", JSON.stringify(results, null, 2));
}

await countModifiersByType();