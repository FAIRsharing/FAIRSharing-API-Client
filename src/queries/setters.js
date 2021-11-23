'use strict'

let clientConfiguration = require("../core/client.conf")
let processQuery = require("../core/processor").processQuery

/**
 * Post the given object to the API to create the corresponding record.
 * @example
 * const newRecord = {
"metadata": {
    "name": "My new record",
    "homepage": "http://example.com",
    "abbreviation": "MNR",
    "contacts": [
        {
            "contact_name": "John Smith",
            "contact_orcid": "00000-321321321",
            "contact_email": "jsmith@example.com"
        }
    ],
    "description": "This record is for my new exciting resource.",
    "status": "ready"
},
"record_type_id": 1,
"subject_ids": [1, 2, 3],
"domain_ids": [1, 2, 3],
"taxonomy_ids": [1, 2, 3],
"user_defined_tag_ids": [1, 2, 3],
"country_ids": [1, 2, 3],
"publication_ids": [1, 2, 3],
"citation_ids": [1, 2, 3]
};
 * RESTClient.createRecord(newRecord).then((res) => {console.log(res)})
 * @param {Object} record
 * @returns {Promise}
 */
module.exports.createRecord = (record) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/fairsharing_records",
        headers: clientConfiguration.headers,
        data:{fairsharing_record: record}
    }, true);
}

/**
 * Update the given record
 * @param {Number} recordID - the record ID to update
 * @param {Object} record - the record new values
 * @returns {Promise}
 */
module.exports.updateRecord = (recordID, record) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration + "/fairsharing_records/" + recordID,
        headers: clientConfiguration.headers,
        data:{fairsharing_record: record}
    }, true);
}

/**
 * Attempt to create a request to become a maintainer/owner of the record. Requires admin validation.
 * @param {Number} recordID - ID for the relevant record.
 * @returns {Promise}
 */
module.exports.claimRecord = (recordID) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/maintenance_requests",
        headers: clientConfiguration.headers,
        data:{maintenance_request: {fairsharing_record_id: recordID}}
    }, true);
}

/**
 * Attempt to create a RecordReview for a user for a FairsharingRecord.
 * @param {Number} recordID - ID for the relevant FairsharingRecord.
 * @returns {Promise}
 */
module.exports.reviewRecord = (recordID) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/record_reviews",
        headers: clientConfiguration.headers,
        data:{record_review: {fairsharing_record_id: recordID}}
    }, true);
}

/**
 * Create a new user defined tag in the database for users to tag their records.
 * @param {String} term - the string value of the term
 * @returns {Promise}
 */
module.exports.createNewUserDefinedTag = (term) =>{
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/user_defined_tags",
        headers: clientConfiguration.headers,
        data:{user_defined_tag: {label:term}}
    }, true);
}

/**
 * Create new a licence link between a licence and a record
 * @example
 * const licenceLink = {
    "fairsharing_record_id": 1,
    "licence_id": 1,
    "relation": "optional_string"
}
 * RESTClient.createLicenceLink(licence_link).then((res) => { console.log(res) })
 * @param {Object} licenceLink - the licence link to create: contains the licence id and the record id.
 * @returns {Promise}
 */
module.exports.createLicenceLink = (licenceLink) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/licence_links",
        headers: clientConfiguration.headers,
        data:{licence_link: licenceLink}
    }, true);
}

/**
 * Delete the given licence
 * @param {Number} licenceLinkID - id of the licence link to delete
 * @returns {Promise}
 */
module.exports.deleteLicenceLink = (licenceLinkID) => {
    return processQuery({
        method: "delete",
        baseURL: clientConfiguration + "/licence_links/" + licenceLinkID,
        headers: clientConfiguration.headers,
    }, true);
}

/**
 * Update the licenceLink
 * @param {Object} licenceLink - the new values for the licence link
 * @returns {Promise}
 */
module.exports.updateLicenceLink = (licenceLink) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration + "/licence_links/" + licenceLink.id,
        headers: clientConfiguration.headers,
        data:{licence_link: licenceLink}
    }, true);
}

/**
 * Creates a new publications
 * @param {Object} publication - the publication to create
 * @returns {Promise}
 */
module.exports.createPublication = (publication) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/publications",
        headers: clientConfiguration.headers,
        data:{ publication: publication }
    }, true);
}

/**
 * Edit the given publication
 * @param {Object} publication - the publication ID and new values
 * @returns {Promise}
 */
module.exports.editPublication = (publication) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration + "/publications/" + publication.id,
        headers: clientConfiguration.headers,
        data:{ publication: publication }
    }, true);
}

/**
 * Saves the relationships as an array of items containing a targetID, a sourceID and a labelID
 * @param {Number} recordID - the record to add the relationships to.
 * @param {Array<Object>} relations - the relations.
 * @returns {Promise}
 */
module.exports.saveRelations = (recordID, relations) => {
    return processQuery({
        method: 'put',
        baseURL: clientConfiguration + '/fairsharing_records/' + recordID,
        headers: clientConfiguration.headers,
        data:{fairsharing_record: {record_associations_attributes: relations}}
    }, true);
}

/**
 * Create a given organisation
 * @param {Object} organisation
 * @returns {Promise}
 * @example
 * const newOrganisation = {
"organisation_type_ids": [
  1
],
"name": "Harlington-Straker Studios",
"homepage": "https://harlington-straker.org",
"alternative_names": [
  "SHADO"
],
"logo": {
  "filename": "shado.jpg",
  "data": "file_data",
  "content_type": "image/jpeg"
}
}
 * RESTClient.createOrganisation(newOrganisation).then((res) => { console.log(res) });
 */
module.exports.createOrganisation = (organisation) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/organisations",
        headers: clientConfiguration.headers,
        data:{ organisation: organisation }
    }, true);
}

/**
 * Create a new grant
 * @param {Object} grant
 * @returns {Promise}
 * @example
 * let newGrant = {
"description": "A rather generous grant.",
"organisation_links_attributes":
[
  {
    "fairsharing_record_id": 1,
    "organisation_id": 1,
    "relation": "funds"
  }
]
}
 * RESTClient.createGrant(newGrant).then((res) => { console.log(res) });
 */
module.exports.createGrant = (grant) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/grants",
        headers: clientConfiguration.headers,
        data:{ grant: grant }
    }, true);
}

/**
 * Create a new link between an organisation, a record and an optional grant.
 * @param {Object} organisationLink - the organisation link to create
 * @example
 * const organisationLink = {
{
"fairsharing_record_id": 1,
"organisation_id": 1,
"relation": "relation"
}
 * RESTClient.createOrganisationLink(organisationLink).then((res) => { console.log(res) });
 * @returns {Promise}
 */
module.exports.createOrganisationLink = (organisationLink) =>{
    return processQuery({
        method: "post",
        baseURL: clientConfiguration + "/organisation_links",
        headers: clientConfiguration.headers,
        data:{ organisation_link: organisationLink }
    }, true);
}

/**
 * Update the organisationLink given from linkID input with the given organisationLink
 * @param {Object} organisationLink - the new organisation link value
 * @param {Number} linkID - ID of the organisationLink to update
 * @returns {Promise}
 */
module.exports.updateOrganisationLink = (organisationLink, linkID) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration + "/organisation_links/" + linkID,
        headers: clientConfiguration.headers,
        data:{ organisation_link: organisationLink }
    }, true);
}

/**
 * Delete the given organisation link
 * @param {Number} linkID - the id of the link to remove
 * @returns {Promise}
 */
module.exports.deleteOrganisationLink = (linkID) => {
    return processQuery({
        method: "delete",
        baseURL: clientConfiguration + "/organisation_links/" + linkID,
        headers: clientConfiguration.headers,
    }, true);
}

/**
 * Update the maintenanceRequest given the new status value. Requires admin right.
 * @param {Number} maintenanceRequest  ID of the maintenanceRequest to update
 * @param {string} newStatus - new status to update
 * @returns {Promise}
 */
module.exports.updateStatusMaintenanceRequest = (maintenanceRequest, newStatus) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration.baseURL + "/maintenance_requests/" + maintenanceRequest,
        headers: clientConfiguration.headers,
        data:{ maintenance_request: {status: newStatus}}
    }, true);
}

/**
 * Delete Record. Requires Admin right.
 * @param {Number} recordID - id of the record link to delete
 * @returns {Promise}
 */
module.exports.deleteRecord = (recordID) => {
    return processQuery({
        method: "delete",
        baseURL: clientConfiguration.baseURL + "/fairsharing_records/" + recordID,
        headers: clientConfiguration.headers,
    }, true);
}
