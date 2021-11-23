const getters = require("./getters");

/**
 * Helper to get countries
 * @param {String} query - optional query string
 * @returns {Promise}
 */
module.exports.getCountries = (query = null) => getters.searchTags("countries", query)

/**
 * Helper to get a country
 * @param {Number} countryID - ID of the country to get
 * @returns {Promise}
 */
module.exports.getCountry = (countryID) => getters.getTag("countries", countryID)

/**
 * Helper to get domains
 * @param {String} query - optional query string
 * @returns {Promise}
 */
module.exports.getDomains = (query = null) => getters.searchTags("domains", query)

/**
 * Helper to get a domain
 * @param {Number} domainID - ID of the domain to get
 * @returns {Promise}
 */
module.exports.getDomain = (domainID) => getters.getTag("domains", domainID)

/**
 * Helper to get subjects
 * @param {String} query - optional query string
 * @returns {Promise}
 */
module.exports.getSubjects = (query = null) => getters.searchTags("subjects", query)

/**
 * Helper to get a subject
 * @param {Number} subjectID - ID of the subject to get
 * @returns {Promise}
 */
module.exports.getSubject = (subjectID) => getters.getTag("subjects", subjectID)

/**
 * Helper to get user defined tags
 * @param {String} query - optional query string
 * @returns {Promise}
 */
module.exports.getUserDefinedTags = (query = null) => getters.searchTags("user_defined_tags", query)

/**
 * Helper to get a user defined tag
 * @param {Number} tagID - ID of the user defined tag to get
 * @returns {Promise}
 */
module.exports.getUserDefinedTag = (tagID) => getters.getTag("user_defined_tags", tagID)

/**
 * Helper to get taxonomies terms
 * @param {String} query - optional query string
 * @returns {Promise}
 */
module.exports.getTaxonomies = (query = null) => getters.searchTags("taxonomies", query)

/**
 * Helper to get a user taxonomy term
 * @param {Number} speciesID - ID of the taxonomy term to get
 * @returns {Promise}
 */
module.exports.getSpecies = (speciesID) => getters.getTag("taxonomies", speciesID)

/**
 * Helper to get a user taxonomy term
 * @param {Number} taxonID - ID of the taxonomy term to get
 * @returns {Promise}
 */
module.exports.getTaxon = (taxonID) => getters.getTag("taxonomies", taxonID)

/**
 * Helper to get publications
 * @param {String} query - optional query string
 * @returns {Promise}
 */
module.exports.getPublications = (query) => getters.searchTags("publications", query)

/**
 * Helper to get a publication
 * @param {Number} pubID - ID of the publication to get
 * @returns {Promise}
 */
module.exports.getPublication = (pubID) => getters.getTag("user_defined_tags", pubID)

/**
 * Helper to get recordTypes
 * @returns {Promise}
 */
module.exports.getRecordTypes = () => getters.searchTags("record_types")
