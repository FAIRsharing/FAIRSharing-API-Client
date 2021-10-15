module.exports = {
    ...require("./src/queries/authentication"),
    ...require("./src/queries/getters"),
    ...require("./src/queries/setters"),
    ...require('./src/queries/validation'),
    ...require('./src/queries/helpers'),
    ...require('./src/core/cache'),
    setURL: (url) => { require('./src/core/client.conf').baseURL = url }
}
