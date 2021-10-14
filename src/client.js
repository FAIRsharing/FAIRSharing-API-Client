module.exports = {
    ...require("./queries/authentication"),
    ...require("./queries/getters"),
    ...require("./queries/setters"),
    ...require('./queries/validation'),
    ...require('./queries/helpers'),
    ...require('./core/cache'),
    setURL: (url) => { require('./core/client.conf').baseURL = url }
}
