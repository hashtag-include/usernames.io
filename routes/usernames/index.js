/// <reference path="../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../typings/request-promise/request-promise.d.ts" />

const Promise = require('bluebird');
const request = require('request-promise');

// all the supported username generators we support
// each checker should return a Promise<string>
const usernames = {
    "wordnik-default": () => {}
}

/**
 * Create username using a random username generator
 * 
 * @returns {Promise<string>} the generated username
 */
function generate() {
    let keys = Object.keys(usernames);
    let key = keys[Math.random() * keys.length];
    
    // invoke the generator for the randomly choosen key and return it's result
    return usernames[key]();
}

// export our behavior
module.exports = exports = {
    generate : generate
};