'use strict'

const axios = require("axios");
let clientConfiguration = require("./client.conf");

/**
 * Throws an error if the user is not logged in
 * @private
 */
function isLoggedIn() { if (!clientConfiguration.headers.Authorization) throw Error("Missing JWT. Please login first") }
// module.exports.isLoggedIn = () => isLoggedIn()

/**
 * Process the query and either get the data from the cache or execute the axios request
 * @param {Object} query - the query to execute
 * @param {Boolean} mustBeLoggedIn - should the user be logged in before attempting to execute the query
 * @returns {Promise}
 */
module.exports = async function processQuery(query, mustBeLoggedIn = false) {
    if (mustBeLoggedIn) isLoggedIn()
    const url = query.baseURL;
    let response = null;
    if (query.method === "get" && clientConfiguration.cacheEnabled) response = getCachedData(url)
    if (!response) {
        response = await executeQuery(query);
        if (response && query.method === "get" && clientConfiguration.cacheEnabled) setCachedData(url, response)
    }
    return (response.data) ? response : {data: response}
}

/**
 * Wrapper for easier axios mocks
 * @private
 * @param query
 * @returns {Promise}
 */
/* istanbul ignore next */
async function executeQuery(query){ return axios(query) }

/**
 * Given a query url tries to find it in the cache.
 * @private
 * @param {String} url
 * @returns {Object|null}
 */
function getCachedData(url) {
    let cache = localStorage.getItem("requestsCache")
    cache = cache ? JSON.parse(cache) : /* istanbul ignore next */ {}
    let data =  cache[url] ? cache[url] : null
    if (data && data['expiry'] && clientConfiguration.cacheEnabled) {
        data = new Date().getTime() > new Date(data['expiry']).getTime() ? null : data
    }
    return (data && data.data) ? data.data : null
}
// module.exports.getCachedData = (url) => getCachedData(url)

/**
 * Write the current response in the local storage
 * @private
 * @param {String} url - a url representing the GET query
 * @param {Object} response - the response object received from the server
 */
function setCachedData(url, response) {
    if (clientConfiguration.cacheEnabled) {
        let cache = JSON.parse(localStorage.getItem("requestsCache"))
        let data = {data: response}
        data.expiry = new Date(new Date().getTime() + (clientConfiguration.cacheExpiry * 60 * 60 * 1000))
        cache[url] = data
        localStorage.setItem("requestsCache", JSON.stringify(cache))
    }
}
// module.exports.setCachedData = (url, response) => setCachedData(url, response)
