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
