import AxiosBcConnection from './AxiosBcConnection.js';

async function countModifiersByType() {    
    const catalogBcConnection = new AxiosBcConnection(),
        response = await catalogBcConnection.getAllProducts("?include_fields=id");
    
    console.log(`Products: ${JSON.stringify(response.length)}`);    
}

await countModifiersByType();