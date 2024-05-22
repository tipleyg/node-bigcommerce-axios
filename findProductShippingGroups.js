const BigCommerce = require("node-bigcommerce"),
    fs = require("fs");

const config = fs.readFileSync("config.json");

/*
{
    "logLevel": "info",
    "clientId": "xxxx",
    "secret": "xxxx",
    "callback": "https://test.test/test",
    "responseType": "json",
    "headers": { 
        "Accept-Encoding": "*" 
    },
    "apiVersion": "v3"
}
*/