import AxiosBcConnection from './AxiosBcConnection.js';

async function countModifiersByType() {    
    const catalogBcConnection = new AxiosBcConnection(),
        response = await catalogBcConnection.getAllProducts({ include: "modifiers"}, 0, 10);
    
    console.log(`Products: ${JSON.stringify(response.meta.pagination.count)}`);    
}

await countModifiersByType();