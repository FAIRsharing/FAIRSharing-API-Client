'use strict'

let clientConfiguration = {
    baseURL: "https://api.fairsharing.org",
    cacheEnabled: false,
    cacheExpiry: 24,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
    userID: null,
    setAuthenticationHeaders(jwt = null) {
        if (jwt) clientConfiguration.headers['Authorization'] = `Bearer ${jwt}`;
        else delete clientConfiguration.headers['Authorization']
    },
    storageAvailable: storageAvailable()
}

/**
 * Test if there's an available localStorage before accessing it.
 * @private
 * @returns {boolean}
 */
function storageAvailable() {
    try {
        let storage = window["localStorage"],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
}

module.exports = clientConfiguration;
