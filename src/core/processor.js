'use strict'

const axios = require("axios");
let clientConfiguration = require("./client.conf");
const cache = require("./cache")


/**
 * Process the query and either get the data from the cache or execute the axios request
 * @param {Object} query - the query to execute
 * @param {Boolean} mustBeLoggedIn - should the user be logged in before attempting to execute the query
 * @returns {Promise}
 */
module.exports.processQuery = async (query, mustBeLoggedIn = false) => {
    if (mustBeLoggedIn) clientConfiguration.isLoggedIn()
    const url = query.baseURL;
    let response = null;
    if (query.method === "get" && clientConfiguration.cacheEnabled) response = cache.getCachedData(url)
    if (!response) {
        response = await axios(query);
        if (response && query.method === "get" && clientConfiguration.cacheEnabled) cache.setCachedData(url, response)
    }
    return (response.data) ? response : {data: response}
}
