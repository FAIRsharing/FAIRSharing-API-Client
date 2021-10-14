'use strict'

let clientConfiguration = require("../core/client.conf"),
    processQuery = require("../core/processor"),
    validation = require("./validation")

/**
 * Get the current user data
 * @returns {Promise}
 */
module.exports.getMyself = () => {
    return processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + "/users/edit",
        headers: clientConfiguration.headers
    }, true);
}

/**
 * Get the given user public data
 * @param userID - ID of the user to get the data from
 * @returns {Promise}
 */
module.exports.getPublicUser = (userID) => {
    return processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + `/user_admin/${userID}`,
        headers: clientConfiguration.headers
    }, true);
}

/**
 * Get a list of all users
 * @returns {Promise}
 */
module.exports.getUsersList = () =>{
    return processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + "/user_admin/",
        headers: clientConfiguration.headers
    });
}

/**
 * Get the list of allowed relation types for editing record's relationships.
 * @returns {Promise}
 */
module.exports.getRelationsTypes = () =>{
    return processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + "/record_associations/allowed"
    });
}

/**
 * Get the list of available profile types for a user.
 * @returns {Promise}
 */
module.exports.getProfileTypes = () =>{
    return processQuery( {
        method: "get",
        baseURL: clientConfiguration.baseURL + "/users/profile_types",
        headers: clientConfiguration.headers,
    });
}

/**
 * Get records without a DOI
 * @returns {Promise}
 */
module.exports.getRecordsWithoutDOI = () => {
    return processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + "/files/no_dois",
    }, true);
}

/**
 * Get the current record
 * @param {Number} recordID - id of the record to get
 * @returns {Promise}
 */
module.exports.getRecord = (recordID) => {
    return processQuery({
        method: "get",
        baseURL: `${clientConfiguration.baseURL}/fairsharing_records/${recordID}`,
        headers: clientConfiguration.headers
    }, true);
}

/**
 * Get the extra metadata fields for a RecordType
 * @param {String} recordType - name of the record type.
 * @returns {Promise}
 */
module.exports.getMetadataFields = (recordType) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/fairsharing_records/metadata_fields",
        headers: clientConfiguration.headers,
        data:{type: recordType}
    }, true);
}

/**
 * Search the countries
 * @param {String} tagType - the type of tag to search for (eg. countries, domains, subjects, ...)
 * @param {String} query - an optional query string
 * @returns {Promise}
 */
module.exports.searchTags = (tagType, query= null) => {
    validation.validateTagType(tagType);
    return processQuery({
        method: "post",
        baseURL: `${clientConfiguration.baseURL}/search/${tagType}`,
        headers: clientConfiguration.headers,
        data: query ? {q: query} : {}
    }, true)
}

/**
 * Get the given tag type
 * @param tagType
 * @param tagID
 * @returns {Promise}
 */
module.exports.getTag = (tagType, tagID) => {
    validation.validateTagType(tagType)
    return processQuery({
        method: "get",
        baseURL: `${clientConfiguration.baseURL}/${tagType}/${tagID}`,
        headers: clientConfiguration.headers,
    }, true)
}

/**
 * Search FAIRsharing records
 * @example
 * RESTClient.searchRecords({q: "GenBank", page: 1, perPage: 2}).then((res) => {console.log(res)})
 * @param {Object} query - optional query string
 * @returns {Promise}
 */
module.exports.searchRecords = (query = {}) => {
    const baseURL = new URL("/search/fairsharing_records", clientConfiguration.baseURL)
    if (query.page) baseURL.searchParams.set("page[number]", query.page)
    if (query.perPage) baseURL.searchParams.set("page[size]", query.perPage)
    return processQuery({
        method: "post",
        baseURL: baseURL.href,
        headers: clientConfiguration.headers,
        data: query.q ? {q: query.q} : {}
    }, true);
}
