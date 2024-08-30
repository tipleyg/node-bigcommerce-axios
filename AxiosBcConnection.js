import axios from 'axios';
import * as fs from 'fs';

export default class AxiosBcConnection {
    constructor() {
        const { xAuthToken, storeHash } = this.getConfig();

        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['X-Auth-Token'] = xAuthToken;

        this.baseUrl = `https://api.bigcommerce.com/stores/${storeHash}`;
        this.baseV3CatalogProductsUrl = `${this.baseUrl}/v3/catalog/products`;
    }

    getConfig() {
        //see config.json format below to create config.json:
        /*{
            "xAuthToken": "xxxx",
            "storeHash": "xxxx"
        }*/
    
        try {
            const configText = fs.readFileSync("config.json");
            
            if (!configText) throw Error("config error in getConfig()");
            
            return JSON.parse(configText);
        } catch (e) {
            throw Error("config error in getConfig()");
        }
    };

    async getProductIdBySKU(sku) {
        try {
            const response = await axios.get(`${this.baseV3CatalogProductsUrl}/?sku=${sku}&include_fields=`),
                product = response.data.data[0];
    
            return product.id;
        } catch (error) {
            throw Error(error);
        }
    }

    async getProductVariantByProdId(productId, sku) {
        try {
            const response = await axios.get(`${this.baseV3CatalogProductsUrl}/${productId}/variants?sku=${sku}&include_fields=sku`),
                variant = response.data.data[0];
            
            return variant?.id;
        } catch (error) {
            throw Error(error);
        }
    }

    async deleteProductVariant(productId, variantId) {
        try {
            const response = await axios.delete(`${this.baseV3CatalogProductsUrl}/${productId}/variants/${variantId}`);

            console.log(`deleted ${productId}/${variantId} status:${response.status}`);
        } catch (error) {
            throw Error(error);
        }
    }

    async updateProductVariantName(productId, { variantId, sku, productName }) {
        const content = {
            sku: sku,
            option_display_name: productName
        };

        try {
            console.log(JSON.stringify(content));
            const response = await axios.put(`${this.baseV3CatalogProductsUrl}/${productId}/variants/${variantId}`, content);

            console.log(`updated ${productId}/${variantId} status:${response.status}`);
        } catch (error) {
            throw Error(error);
        }
    }
}