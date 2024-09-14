import * as fs from 'fs';

function postResponseMap ({ postResponseMapData }) {
  //a variant is a combination of variant options with a SKU
  //and price under a product ID
  
  //group the data by product_id
  const productsObj = makeProdObjFromModifiers(postResponseMapData),
  products = makeProdArray(productsObj),
  variants = [];      
  
  
  let n = 1;
  
  products.forEach(prod => {
    try {
      const optionValues = prod.varOpts.map(opt => {
        opt.option_values.forEach(f => {
          f.optParentId = opt.id;
        });

        return opt.option_values;  //array of arrays of option values
      });

      const combinations = getOptionCombinations(optionValues);
  
      const variant = {
        prod_id: prod.id,
        sku: prod.sku,
        price: prod.price,
        variants: combinations.map(vr => ({
          sku: prod.sku + '-' + n++,
          prod_id: prod.id,
          price: makePrice(prod.price, vr),
          varCombo: vr
        }))
      };
      
      variants.push(variant);
    } catch (error) {
      throw new Error('Error processing record');
    }
  });

  postResponseMapData[0].variants = flattenVariants(variants);
  
  return postResponseMapData;
}

function flattenVariants(products) {
  const flat = [];

  for (const prod of products) {
    for (const variant of prod.variants) {
      flat.push(variant);
    }
  }

  return flat;
}

function makeProdObjFromModifiers(modifiers) {
  const products = {};
  
  modifiers.forEach(modifier => { //the record is called modifier because that's how the data started and variantOption data was added
    const { product_id } = modifier;
    
    if (!products[product_id]) {
      products[product_id] = new Object(modifier.parent);
      products[product_id].varOpts = [];
    }
    
    modifier.variantOptionData.option_values.forEach(varOptVal => {
      const modOptVal = modifier.option_values.find(ov => ov.label === varOptVal.label);

      if (modOptVal && modOptVal.adjusters && modOptVal.adjusters.price && modOptVal.adjusters.price.adjuster_value) {
        varOptVal.priceAdjuster = modOptVal.adjusters.price.adjuster_value;
      } else varOptVal.priceAdjuster = 0;
    });

    products[product_id].varOpts.push(modifier.variantOptionData);
  });
  
  return products;
}

function makeProdArray(prodObj) {
  const prodArray = [];
  
  for (const key in prodObj) {
    prodArray.push(prodObj[key]);
  }
  
  return prodArray;
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

(function() {
  const result = postResponseMap({
    "postResponseMapData": [
      {
        "id": 8481,
        "product_id": 43455,
        "name": "Voltage1724533690-43455",
        "display_name": "Voltage",
        "type": "rectangles",
        "required": true,
        "sort_order": 3,
        "config": [],
        "option_values": [
          {
            "id": 41132,
            "option_id": 8481,
            "label": "115/1/60",
            "sort_order": 0,
            "value_data": {},
            "is_default": true,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41133,
            "option_id": 8481,
            "label": "230/1/60",
            "sort_order": 1,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41134,
            "option_id": 8481,
            "label": "230/3/60",
            "sort_order": 2,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41135,
            "option_id": 8481,
            "label": "460/3/60",
            "sort_order": 3,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          }
        ],
        "parent": {
          "id": 43455,
          "name": "TEST GT Copy of Coffing JLC 1/8 Ton Electric Hoist - 32 fpm, Single or Three Phase",
          "sku": "DNJLC0232-1",
          "weight": 65,
          "price": 3167,
          "page_title": "Coffing JLC 1/8 Ton Electric Hoist - 32 fpm, Single or Three Phase JLC0232"
        },
        "variantOptionID": 8498,
        "variantOptionData": {
          "id": 8498,
          "product_id": 43455,
          "name": "Voltage1724552840-43455",
          "display_name": "Voltage",
          "type": "rectangles",
          "sort_order": 3,
          "option_values": [
            {
              "id": 41198,
              "label": "115/1/60",
              "sort_order": 0,
              "value_data": null,
              "is_default": true
            },
            {
              "id": 41199,
              "label": "230/1/60",
              "sort_order": 1,
              "value_data": null,
              "is_default": false
            },
            {
              "id": 41200,
              "label": "230/3/60",
              "sort_order": 2,
              "value_data": null,
              "is_default": false
            },
            {
              "id": 41201,
              "label": "460/3/60",
              "sort_order": 3,
              "value_data": null,
              "is_default": false
            }
          ],
          "config": []
        }
      },
      {
        "id": 8482,
        "product_id": 43455,
        "name": "Lift1724533690-43455",
        "display_name": "Lift",
        "type": "dropdown",
        "required": true,
        "sort_order": 4,
        "config": [],
        "option_values": [
          {
            "id": 41136,
            "option_id": 8482,
            "label": "10 ft. Lift Chain Container Included",
            "sort_order": 0,
            "value_data": {},
            "is_default": true,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41137,
            "option_id": 8482,
            "label": "15 ft. Lift Chain Container Included",
            "sort_order": 1,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 352.22
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41138,
            "option_id": 8482,
            "label": "20 ft. Lift Chain Container Included",
            "sort_order": 2,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 460.32
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          }
        ],
        "parent": {
          "id": 43455,
          "name": "TEST GT Copy of Coffing JLC 1/8 Ton Electric Hoist - 32 fpm, Single or Three Phase",
          "sku": "DNJLC0232-1",
          "weight": 65,
          "price": 3167,
          "page_title": "Coffing JLC 1/8 Ton Electric Hoist - 32 fpm, Single or Three Phase JLC0232"
        },
        "variantOptionID": 8499,
        "variantOptionData": {
          "id": 8499,
          "product_id": 43455,
          "name": "Lift1724552840-43455",
          "display_name": "Lift",
          "type": "dropdown",
          "sort_order": 4,
          "option_values": [
            {
              "id": 41202,
              "label": "10 ft. Lift Chain Container Included",
              "sort_order": 0,
              "value_data": null,
              "is_default": true
            },
            {
              "id": 41203,
              "label": "15 ft. Lift Chain Container Included",
              "sort_order": 1,
              "value_data": null,
              "is_default": false
            },
            {
              "id": 41204,
              "label": "20 ft. Lift Chain Container Included",
              "sort_order": 2,
              "value_data": null,
              "is_default": false
            }
          ],
          "config": []
        }
      },
      {
        "id": 8483,
        "product_id": 43455,
        "name": "Suspension1724533691-43455",
        "display_name": "Suspension",
        "type": "dropdown",
        "required": true,
        "sort_order": 5,
        "config": [],
        "option_values": [
          {
            "id": 41139,
            "option_id": 8483,
            "label": "Rigid Hook",
            "sort_order": 0,
            "value_data": {},
            "is_default": true,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41140,
            "option_id": 8483,
            "label": "Lug Mount",
            "sort_order": 1,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 0
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41141,
            "option_id": 8483,
            "label": "Universal Plain Trolley",
            "sort_order": 2,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 391
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41142,
            "option_id": 8483,
            "label": "Motorized Trolley 35 fpm",
            "sort_order": 3,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 4839
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          },
          {
            "id": 41143,
            "option_id": 8483,
            "label": "Motorized Trolley 75 fpm",
            "sort_order": 4,
            "value_data": {},
            "is_default": false,
            "adjusters": {
              "price": {
                "adjuster": "relative",
                "adjuster_value": 4839
              },
              "weight": null,
              "image_url": "",
              "purchasing_disabled": {
                "status": false,
                "message": ""
              }
            }
          }
        ],
        "parent": {
          "id": 43455,
          "name": "TEST GT Copy of Coffing JLC 1/8 Ton Electric Hoist - 32 fpm, Single or Three Phase",
          "sku": "DNJLC0232-1",
          "weight": 65,
          "price": 3167,
          "page_title": "Coffing JLC 1/8 Ton Electric Hoist - 32 fpm, Single or Three Phase JLC0232"
        },
        "variantOptionID": 8500,
        "variantOptionData": {
          "id": 8500,
          "product_id": 43455,
          "name": "Suspension1724552840-43455",
          "display_name": "Suspension",
          "type": "dropdown",
          "sort_order": 5,
          "option_values": [
            {
              "id": 41205,
              "label": "Rigid Hook",
              "sort_order": 0,
              "value_data": null,
              "is_default": true
            },
            {
              "id": 41206,
              "label": "Lug Mount",
              "sort_order": 1,
              "value_data": null,
              "is_default": false
            },
            {
              "id": 41207,
              "label": "Universal Plain Trolley",
              "sort_order": 2,
              "value_data": null,
              "is_default": false
            },
            {
              "id": 41208,
              "label": "Motorized Trolley 35 fpm",
              "sort_order": 3,
              "value_data": null,
              "is_default": false
            },
            {
              "id": 41209,
              "label": "Motorized Trolley 75 fpm",
              "sort_order": 4,
              "value_data": null,
              "is_default": false
            }
          ],
          "config": []
        }
      }
    ],
    "_importId": "667efd5810ee3d1a66ccf2ba",
    "_connectionId": "667ef9cbe26571363e93a83a",
    "_flowId": "667ef9f9aeff4891c8c8d196",
    "_integrationId": "667f0e83e26571363e9beed0",
    "settings": {
      "integration": {},
      "flowGrouping": {},
      "flow": {},
      "import": {},
      "connection": {},
      "iClient": {}
    },
    "testMode": false
  });

  fs.writeFileSync("res.json", JSON.stringify(result, null, 2));
})();