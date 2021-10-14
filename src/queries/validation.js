'use strict'

let clientConfiguration = require("../core/client.conf")
let processQuery = require("../core/processor")

/**
 * Validates the tag type against allowed types
 * @private
 * @param {String} tagType
 */
module.exports.validateTagType = (tagType) => {
    const allowed = [
        "countries",
        "domains",
        "subjects",
        "user_defined_tags",
        "taxonomies",
        "publications",
        "record_types"
    ]
    if (!allowed.includes(tagType)) throw Error(`tag type should be one of ${allowed.join(", ")}`)
}

/**
 * Determine if a user has permission to edit this record.
 * @param {Number} recordID - ID of the record.
 * @returns {Promise}
 */
module.exports.canEdit = (recordID) => {
    const request = {
        method: "get",
        baseURL: clientConfiguration.baseURL + "/fairsharing_records/can_edit/" + recordID,
        headers: clientConfiguration.headers,
    };
    return processQuery(request, true);
}

/**
 * Determine if a the logged in user has permission to claim a record.
 * @param {Number} recordID - ID for the relevant FairsharingRecord.
 * @returns {Promise}
 */
module.exports.canClaim = (recordID) => {
    const request = {
        method: "get",
        baseURL: clientConfiguration.baseURL + "/maintenance_requests/existing/" + recordID,
        headers: clientConfiguration.headers,
    };
    return processQuery(request, true);
}
