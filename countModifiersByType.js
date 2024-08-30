import AxiosBcConnection from './AxiosBcConnection.js';

async function countModifiersByType() {    
    const catalogBcConnection = new AxiosBcConnection(),
        response = await catalogBcConnection.getAllProducts("include=modifiers&limit=10&page=0");
    
    console.log(`Products: ${JSON.stringify(response.meta.pagination.count)}`);    
}

await countModifiersByType();