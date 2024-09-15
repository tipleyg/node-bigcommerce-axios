import AxiosBcConnection from './AxiosBcConnection.js';

async function main() {    
    const cnxn = new AxiosBcConnection();

    async function liberateModifierNamespaces(prodId, modId, content) {
        return cnxn.updateProductModifier(prodId, modId, content);
    }
    
    async function createVariantOptions(prodId, mod) {
        const content = {
            display_name: mod.display_name,//.replace(/\*/g, ""),
            product_id: prodId,
            type: mod.type,
            sort_order: mod.sort_order,
            option_values: mod.option_values.map(ov => ({
                is_default: ov.is_default,
                label: ov.label,
                sort_order: ov.sort_order,
                value_data: {}
            }))
        };

        return (await cnxn.createVariantOption(prodId, content));
    }

    async function makeVariantsFromModifiers() {
        const products = await getAllProducts(); 
    
        for (const prod of products) {
            if (prod.modifiers && prod.modifiers.length) {
                //loop through modifiers and change names to *name* to free up that namespace
                prod.variantOptions = [];

                for (const mod of prod.modifiers) {
                    //console.log(`Product has modifiers: ${JSON.stringify(prod.modifiers.length)}`);

                    const content = {
                        display_name: `*${mod.display_name.replace(/\*/g, '')}*`
                    };            
                    
                    await liberateModifierNamespaces(prod.id, mod.id, content);

                    prod.variantOptions.push(await createVariantOptions(prod.id, mod));

                    
                    //console.log(JSON.stringify(mod.variantOption));
                    //await makeVariantsFromModifiers()
                }
            }
        }
    }
    
    async function getAllProducts() {
        const params = "?include=variants,modifiers"
            +"&include_fields=name,sku,price,weight,page_title"
            +"&id:in=43477", //includes product IDs
        response = await cnxn.getAllProducts(params, 0, 10);
    
        console.log(`Products: ${JSON.stringify(response.length)}`);
    
        return response;
    }
    
    await makeVariantsFromModifiers();
}

await main();