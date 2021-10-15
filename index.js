let cache = require('./src/core/cache')

cache.clearCache()

module.exports = {
    ...require("./src/queries/authentication"),
    ...require("./src/queries/getters"),
    ...require("./src/queries/setters"),
    ...require('./src/queries/validation'),
    ...require('./src/queries/helpers'),
    setURL: (url) => { require('./src/core/client.conf').baseURL = url },
    enableCache: (timer) => {cache.enableCache(timer)},
    disableCache: () => {cache.disableCache()},
    clearCache: () => {cache.clearCache()},
}
