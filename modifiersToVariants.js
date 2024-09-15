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
                let n = 1;
                prod.varOpts = [];
                
                for (const mod of prod.modifiers) {
                    //console.log(`Product has modifiers: ${JSON.stringify(prod.modifiers.length)}`);
                    
                    const content = {
                        display_name: `*${mod.display_name.replace(/\*/g, '')}*`
                    };
                    
                    await liberateModifierNamespaces(prod.id, mod.id, content);

                    prod.varOpts.push(await createVariantOptions(prod.id, mod));
                }
                
                // next, I recursively form the "variants" out of combinations of variant options                
                if (prod.varOpts && prod.varOpts.length) {
                    prod.variants = [];

                    const optionValues = prod.varOpts.map(opt => {
                        opt.option_values.forEach(f => {
                            f.optParentId = opt.id;
                        });

                        return opt.option_values;  //array of arrays of option values
                    });

                    const combinations = getOptionCombinations(optionValues);

                    /*prod.variants = {
                        prod_id: prod.id,
                        sku: prod.sku,
                        price: prod.price,
                        variantCombos: combinations.map(vr => ({
                            sku: prod.sku + '-' + n++,
                            prod_id: prod.id,
                            price: makePrice(prod.price, vr),
                            varCombo: vr
                        }))
                    };*/
                    prod.variants = combinations.map(vr => ({
                        sku: prod.sku + '-' + n++,
                        prod_id: prod.id,
                        price: makePrice(prod.price, vr),
                        varCombo: vr
                    }));


                }
            }
        }

    }

    function getOptionCombinations(optionValues) {  //needs to include an optionId!!!
        if (optionValues.length === 0) return [[]];

        const first = optionValues[0],
            rest = getOptionCombinations(optionValues.slice(1)),
            combinations = [];

        for (let i = 0; i < first.length; i++) {
            for (let j = 0; j < rest.length; j++) {
                combinations.push([first[i], ...rest[j]]);
            }
        }

        return combinations;
    }

    function makePrice(price, combo) {
        let adjustments = 0;

        for (const opt of combo) {
            if (opt.priceAdjuster) {
                adjustments += opt.priceAdjuster
            }
        }

        return Number((price + adjustments).toFixed(2));
    }

    async function getAllProducts() {
        const params = "?include=variants,modifiers"
            + "&include_fields=name,sku,price,weight,page_title"
            + "&id:in=43477", //includes product IDs
            response = await cnxn.getAllProducts(params, 0, 10);

        console.log(`Products: ${JSON.stringify(response.length)}`);

        return response;
    }
    await makeVariantsFromModifiers();

}

await main();