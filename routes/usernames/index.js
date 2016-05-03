/// <reference path="../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../typings/request-promise/request-promise.d.ts" />

const Promise = require('bluebird');
const request = require('request-promise');
const baseball = require('baseball');
const upperCamelCase = require('uppercamelcase');
const appInsights = require("applicationinsights");

// require WORDNIK_KEY token to be set at runtime
// see github.com/bengreenier/baseball for more info
baseball("WORDNIK_KEY");
baseball("APPINSIGHTS_INSTRUMENTATIONKEY");

// all the supported username generators we support
// each checker should return a Promise<string>
const usernames = {
    "wordnik-verb": () => {
        let rootEndpoint = "http://api.wordnik.com/v4/words.json/randomWord";
        let apiKey = process.env.WORDNIK_KEY;
        
        let verbMinLength = 0;
        let verbMaxLength = 6;
        
        let idiomMinLength = 0;
        let idiomMaxLength = 10;
        
        // return a promise that makes the calls to get our verb and our idiom
        return Promise.all([
            request.get(`${rootEndpoint}?includePartOfSpeech=verb&minLength=${verbMinLength}&maxLength=${verbMaxLength}&api_key=${apiKey}`, {
                transform: (body) => {
                    return body.word;
                },
                json: true
            }),
            request.get(`${rootEndpoint}?includePartOfSpeech=idiom&minLength=${idiomMinLength}&maxLength=${idiomMaxLength}&api_key=${apiKey}`, {
                transform: (body) => {
                    return body.word;
                },
                json: true
            })
        ]).spread((verb, idiom) => {
            
            // track this generation via app insights
            let client = appInsights.getClient();
            client.trackEvent("wordnik-verb", {verb: verb, idiom: idiom});
            
            // concatenate the verb and the idiom using pascal casing
            return upperCamelCase(verb, idiom);
        });
    },
    "wordnik-adjective": () => {
        let rootEndpoint = "http://api.wordnik.com/v4/words.json/randomWord";
        let apiKey = process.env.WORDNIK_KEY;
        
        let adjMinLength = 0;
        let adjMaxLength = 6;
        
        let idiomMinLength = 0;
        let idiomMaxLength = 10;
        
        // return a promise that makes the calls to get our adj and our idiom
        return Promise.all([
            request.get(`${rootEndpoint}?includePartOfSpeech=adjective&minLength=${adjMinLength}&maxLength=${adjMaxLength}&api_key=${apiKey}`, {
                transform: (body) => {
                    return body.word;
                },
                json: true
            }),
            request.get(`${rootEndpoint}?includePartOfSpeech=idiom&minLength=${idiomMinLength}&maxLength=${idiomMaxLength}&api_key=${apiKey}`, {
                transform: (body) => {
                    return body.word;
                },
                json: true
            })
        ]).spread((adj, idiom) => {
            
            // track this generation via app insights
            let client = appInsights.getClient();
            client.trackEvent("wordnik-adjective", {adjective: adj, idiom: idiom});
            
            // concatenate the adj and the idiom using pascal casing
            return upperCamelCase(adj, idiom);
        });
    }
}

/**
 * Create username using a random username generator
 * 
 * @returns {Promise<string>} the generated username
 */
function generate() {
    let keys = Object.keys(usernames);
    let key = keys[Math.floor(Math.random() * keys.length)];
    
    // invoke the generator for the randomly choosen key and return it's result
    return usernames[key]();
}

// export our behavior
module.exports = exports = {
    generate : generate
};
