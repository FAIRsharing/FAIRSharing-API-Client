'use strict'

let clientConfiguration = require("./client.conf");

/**
 * Enables the localStorage cache
 * @param {Number} timer - in hours
 */
module.exports.enableCache = (timer = 24) => {
    if (clientConfiguration.storageAvailable) {
        clientConfiguration.cacheEnabled = true
        clientConfiguration.cacheExpiry = timer
    }
    else console.info('\x1b[31m%s\x1b[0m',
        'The cache relies on localStorage and thus is not supported in this environment.');
}

/**
 * Disable the localStorage cache
 */
module.exports.disableCache = () => {
    clientConfiguration.cacheEnabled = false
    clientConfiguration.cacheExpiry = 24
}

/**
 * Clear the current cache
 */
module.exports.clearCache = () => {
    if (clientConfiguration.storageAvailable) localStorage.setItem("requestsCache", JSON.stringify({}))
}

/**
 * Given a query url tries to find it in the cache.
 * @private
 * @param {String} url
 * @returns {Object|null}
 */
module.exports.getCachedData = (url) => {
    let cache = localStorage.getItem("requestsCache")
    cache = cache ? JSON.parse(cache) : /* istanbul ignore next */ {}
    let data =  cache[url] ? cache[url] : null
    if (data && data['expiry'] && clientConfiguration.cacheEnabled) {
        data = new Date().getTime() > new Date(data['expiry']).getTime() ? null : data
    }
    return (data && data.data) ? data.data : null
}

/**
 * Write the current response in the local storage
 * @private
 * @param {String} url - a url representing the GET query
 * @param {Object} response - the response object received from the server
 */
module.exports.setCachedData = (url, response) => {
    if (clientConfiguration.cacheEnabled) {
        let cache = JSON.parse(localStorage.getItem("requestsCache"))
        let data = {data: response}
        data.expiry = new Date(new Date().getTime() + (clientConfiguration.cacheExpiry * 60 * 60 * 1000))
        cache[url] = data
        localStorage.setItem("requestsCache", JSON.stringify(cache))
    }
}
