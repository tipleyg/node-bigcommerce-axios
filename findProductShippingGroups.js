import axios from 'axios';
import * as fs from 'fs';

const config = getConfig();
if (!config) throw Error("no config");
/*{
    "logLevel": "info",
    "clientId": "xxxx",
    "secret": "xxxx",
    "callback": "https://test.test/test",
    "responseType": "json",
    "storeHash": "storeHash",
    "headers": { 
        "Accept-Encoding": "*" 
    },
    "apiVersion": "v3"
}*/

function getConfig() {
    const configText = fs.readFileSync("config.json");
    
    if (!configText) return;
    
    return JSON.parse(configText);
}

function initAxiosHeaders(axios) {
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['X-Auth-Token'] = config["x-auth-token"];
}

function productMap(product) {
    const { id, name, sku } = product;

    return {
        id, name, sku
    };
}

(async () => {
    let url = `https://api.bigcommerce.com/stores/${config.storeHash}/v3/catalog/products`;// /43451`;
    
    initAxiosHeaders(axios);

    try {
      const response = await axios.get(url);
      
      const products = response.data.data.map(productMap);
    } catch (error) {
      console.error(error);
    }
})();