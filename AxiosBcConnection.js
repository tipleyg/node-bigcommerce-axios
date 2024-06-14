import axios from 'axios';
import * as fs from 'fs';

let baseUrl = '';

export default class AxiosBcConnection {
    constructor() {
        const { xAuthToken, storeHash } = this.getConfig();

        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['X-Auth-Token'] = xAuthToken;

        baseUrl = `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products`;
    }

    getConfig() {
        //see config.json format below to create config.json:
        /*{
            "xAuthToken": "xxxx",
            "storeHash": "xxxx"
        }*/
    
        try {
            const configText = fs.readFileSync("config.json");
            
            if (!configText) return;
            
            return JSON.parse(configText);
        } catch (e) {
            console.error(e);
        }
    };

    async getProductIdBySKU(sku) {
        try {
            const response = await axios.get(`${baseUrl}/?sku=${sku}&include_fields=`),
                product = response.data.data[0];
    
            return product.id;
        } catch (error) {
            console.error(error);
        }
    }

    async getProductVariantByProdId(productId, sku) {
        try {
            const response = await axios.get(`${baseUrl}/${productId}/variants?sku=${sku}&include_fields=sku`),
                variant = response.data.data[0];
            
            return variant?.id;
        } catch (error) {
            console.error(error);
        }
    }
}