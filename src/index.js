const axios = require("axios")

class RESTClient {

    /**
     * The RESTClient is a singleton class that handles the connection and data exchange from the back-end
     * REST API.
     */
    constructor(url){
        if (RESTClient._instance){
            this.baseURL = url;
            return RESTClient._instance;
        }
        RESTClient._instance = this;
        this.baseURL = url;
        this.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        };
    }

    /* *******************************************************************
                        USER AND USER AUTHENTICATION METHODS
    *******************************************************************  */

    /**
     * Method to add authorisation token to the headers.
     * @param jwt - the user's json web token
     * @return {JSON} - headers with authorisation field added
     */
    set_authentication_headers(jwt) {
        if (jwt) this.headers['Authorization'] = `Bearer ${jwt}`;
        else delete this.headers['Authorization']
    }

    /**
     * Makes sure the user is logged in to before triggering the query.
     */
    is_loggedIn() {
        if (!this.headers.Authorization) throw Error("Missing JWT. Please login first");
    }

    /**
     * Method to log in the user and set the JWT into the headers
     * @param username - name of the user
     * @param password - password of the user
     * @return {Promise} - the response of the server
     */
    async login(username, password){
        const endpoint = "/users/sign_in";
        const body = {
            user: {
                login: username,
                password: password
            }
        };
        const request = {
            method: "post",
            baseURL: this.baseURL + endpoint,
            data: body,
            headers: this.headers
        };
        let response = await this.executeQuery(request);
        if (!response.error){
            this.set_authentication_headers(response.data['jwt'])
        }
        return response.data;
    }

    /**
     * Logout the user from the back, expiring the current jwt.
     * @returns {Promise}
     */
    async logout(){
        const request = {
            method: "delete",
            baseURL: this.baseURL + "/users/sign_out",
            headers: this.headers
        };
        let response = await this.executeQuery(request);
        this.set_authentication_headers(null)
        return response.data;
    }

    /**
     *  Method to create a new user
     * @param {Object} userAccount - the user account to create
     * @returns {Promise} response - server response
     */
    async createAccount(userAccount){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/users",
            data: {user: userAccount},
            headers: this.headers
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Validate the account given the corresponding token received in the email
     * @param {String} token - the account token to validate
     * @returns {Promise}
     */
    async confirmAccount(token){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/users/confirmation?confirmation_token=" + token,
            headers: this.headers,
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Method to send a reset password link to the given email address
     * @param {String} email to send the link to
     * @returns {Promise}
     */
    async requestResetPwd(email){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/users/password",
            headers: this.headers,
            data: {
                user: {email: email}
            }
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Resend the validation link for a given user
     * @param {Object} user - contains the email of the user.
     * @returns {Promise}
     */
    async resendConfirmation(user) {
        const request = {
            method: "post",
            baseURL: this.baseURL + "/users/confirmation",
            headers: this.headers,
            data: {user: user}
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Reset the password of the given user
     * @param {Object} user - contains the new pwd, repeated pwd and token received in the email.
     * @returns {Promise}
     */
    async resetPassword(user){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/users/password",
            headers: this.headers,
            data: {user: user}
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Changes the password of the logged in user
     * @param {Object} user - contains the current, new and repeated new password
     * @returns {Promise}
     */
    async resetPasswordWithoutToken(user){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/users/",
            headers: this.headers,
            data: {user: user}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Verify the given password is strong enough
     * @param {String} password - the password to test
     * @returns {Promise}
     */
    async verifyPassword(password){
        let headers = JSON.parse(JSON.stringify(this.headers));
        const request = {
            method: "post",
            baseURL: this.baseURL + "/users/check_password",
            headers: headers,
            data: {password: password}
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Get the current user data
     * @returns {Promise}
     */
    async getMyself(){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/users/edit",
            headers: this.headers
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Get the current user data
     * @param userID - ID of the user to get the data from
     * @returns {Promise}
     */
    async getPublicUser(userID){
        const request = {
            method: "get",
            baseURL: this.baseURL + `/user_admin/${userID}`,
            headers: this.headers
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Get all users list
     * @returns {Promise}
     */
    async getUsersList(){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/user_admin/",
            headers: this.headers
        };
        let response = await this.executeQuery(request);
        return response.data;
    }

    /**
     * Edit the current logged in user profile
     * @param {Object} newUser - the new values for the logged in user
     * @returns {Promise}
     */
    async editMyself(newUser){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/users",
            headers: this.headers,
            data: {user: newUser}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Edit the given user profile. Requires Admin rights.
     * @param {Object} newUser - the new values for the user to edit.
     * @returns {Promise}
     */
    async editUser(newUser){
        const request = {
            method: "put",
            baseURL: this.baseURL + `/user_admin/${newUser.id}` ,
            headers: this.headers,
            data: {user: newUser}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Delete the user
     * @param userID - the ID of the user to delete. Requires Admin rights.
     * @returns {Promise}
     */
    async deleteUser(userID){
        const request = {
            method: "delete",
            baseURL: this.baseURL + `/user_admin/${userID}` ,
            headers: this.headers,
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Verify that the given JWT is still valid
     * @returns {Promise}
     */
    async validateToken(){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/users/valid",
            headers: this.headers
        };
        let response = await this.executeQuery(request, true);
        if (!response.data.success) this.set_authentication_headers(null)
        return response.data;
    }


    /* *******************************************************************
                                EDITOR METHODS
    *******************************************************************  */

    /**
     * Post the given object to the API to create the corresponding record.
     * @param {Object} record
     * @returns {Promise}
     */
    async createRecord(record){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/fairsharing_records",
            headers: this.headers,
            data: {fairsharing_record: record}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Update the given record
     * @param {Number} recordID - the record ID to update
     * @param {Object} record - the record new values
     * @returns {Promise}
     */
    async updateRecord(recordID, record){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/fairsharing_records/" + recordID,
            headers: this.headers,
            data: {fairsharing_record: record}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Determine if a user has permission to edit this record.
     * @param {Number} recordID - ID of the record.
     * @returns {Promise}
     */
    async canEdit(recordID){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/fairsharing_records/can_edit/" + recordID,
            headers: this.headers,
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Attempt to create a request to become a maintainer/owner of the record. Requires admin validation.
     * @param {Number} recordID - ID for the relevant record.
     * @returns {Promise}
     */
    async claimRecord(recordID) {
        const request = {
            method: "post",
            baseURL: this.baseURL + "/maintenance_requests",
            headers: this.headers,
            data: {maintenance_request: {fairsharing_record_id: recordID}}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Determine if a the logged in user has permission to claim a record.
     * @param {Number} recordID - ID for the relevant FairsharingRecord.
     * @returns {Promise}
     */
    async canClaim(recordID) {
        const request = {
            method: "get",
            baseURL: this.baseURL + "/maintenance_requests/existing/" + recordID,
            headers: this.headers,
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Attempt to create a RecordReview for a user for a FairsharingRecord.
     * @param {Number} recordID - ID for the relevant FairsharingRecord.
     * @returns {Promise}
     */
    async reviewRecord(recordID) {
        const request = {
            method: "post",
            baseURL: this.baseURL + "/record_reviews",
            headers: this.headers,
            data: {record_review: {fairsharing_record_id: recordID}}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Create a new user defined tag in the database for users to tag their records.
     * @param {String} term - the string value of the term
     * @returns {Promise}
     */
    async createNewUserDefinedTag(term){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/user_defined_tags",
            headers: this.headers,
            data: {user_defined_tag: {label:term}}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * TODO: TEST AND WRITE THE INPUT EXAMPLE
     * Create new a licence link between a licence and a record
     * @param {Object} licenceLink - the licence link to create: contains the licence id and the record id.
     * @returns {Promise}
     */
    async createLicenceLink(licenceLink){
        let _client = this;
        const request = {
            method: "post",
            baseURL: _client.baseURL + "/licence_links",
            headers: this.headers,
            data: {licence_link: licenceLink}
        };
        let response = await _client.executeQuery(request, true);
        return response.data;
    }

    /**
     * Delete the given licence
     * @param {Number} licenceLinkID - id of the licence link to delete
     * @returns {Promise}
     */
    async deleteLicenceLink(licenceLinkID){
        let _client = this;
        const request = {
            method: "delete",
            baseURL: _client.baseURL + "/licence_links/" + licenceLinkID,
            headers: this.headers,
        };
        let response = await _client.executeQuery(request, true);
        return response.data;
    }

    /**
     * Update the licenceLink
     * @param {Object} licenceLink - the new values for the licence link
     * @returns {Promise}
     */
    async updateLicenceLink(licenceLink){
        let _client = this;
        const request = {
            method: "put",
            baseURL: _client.baseURL + "/licence_links/" + licenceLink.id,
            headers: this.headers,
            data: {licence_link: licenceLink}
        };
        let response = await _client.executeQuery(request, true);
        return response.data;
    }

    /**
     * Creates a new publications
     * @param {Object} publication - the publication to create
     * @returns {Promise}
     */
    async createPublication(publication){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/publications",
            headers: this.headers,
            data: { publication: publication }
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Edit the given publication
     * @param {Object} publication - the publication ID and new values
     * @returns {Promise}
     */
    async editPublication(publication){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/publications/" + publication.id,
            headers: this.headers,
            data: { publication: publication }
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Saves the relationships as an array of items containing a targetID, a sourceID and a labelID
     * @param {Number} recordID - the record to add the relationships to.
     * @param {Array<Object>} relations - the relations.
     * @returns {Promise}
     */
    async saveRelations(recordID, relations){
        const request = {
            method: 'put',
            baseURL: this.baseURL + '/fairsharing_records/' + recordID,
            headers: this.headers,
            data: {fairsharing_record: {record_associations_attributes: relations}}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Create a given organisation
     * @param {Object} organisation
     * @returns {Promise}
     */
    async createOrganisation(organisation){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/organisations",
            headers: this.headers,
            data: { organisation: organisation }
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Create a given grant
     * @param {Object} grant
     * @returns {Promise}
     */
    async createGrant(grant){
        const request = {
            method: "post",
            baseURL: this.baseURL + "/grants",
            headers: this.headers,
            data: { grant: grant }
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Create a new link between an organisation, a record and an optional grant.
     * @param {Object} organisationLink - the organisation link to create
     * @returns {Promise}
     */
    async createOrganisationLink(organisationLink){
        let _client = this;
        const request = {
            method: "post",
            baseURL: _client.baseURL + "/organisation_links",
            headers: this.headers,
            data: { organisation_link: organisationLink }
        };
        let response = await _client.executeQuery(request, true);
        return response.data;
    }

    /**
     * Update the organisationLink given from linkID input with the given organisationLink
     * @param {Object} organisationLink - the new organisation link value
     * @param {Number} linkID - ID of the organisationLink to update
     * @returns {Promise}
     */
    async updateOrganisationLink(organisationLink, linkID){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/organisation_links/" + linkID,
            headers: this.headers,
            data: { organisation_link: organisationLink }
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Delete the given organisation link
     * @param {Number} linkID - the id of the link to remove
     * @returns {Promise}
     */
    async deleteOrganisationLink(linkID){
        let _client = this;
        const request = {
            method: "delete",
            baseURL: _client.baseURL + "/organisation_links/" + linkID,
            headers: this.headers,
        };
        let response = await _client.executeQuery(request, true);
        return response.data;
    }

    /**
     * Get the extra metadata fields for a RecordType
     * @param {String} type - name of the record type.
     * @returns {Promise}
     */
    async extraMetadataFields(type) {
        const request = {
            method: "post",
            baseURL: this.baseURL + "/fairsharing_records/metadata_fields",
            headers: this.headers,
            data: {type: type}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Get the list of allowed relation types for editing record's relationships.
     * @returns {Promise}
     */
    async getRelationsTypes(){
        let _client = this;
        const request = {
            method: "get",
            baseURL: _client.baseURL + "/record_associations/allowed"
        };
        let response = await _client.executeQuery(request);
        return response.data;
    }

    /**
     * Get the list of available profile types for a user.
     * @returns {Promise}
     */
    async getProfileTypes(){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/users/profile_types",
            headers: this.headers,
        };
        let response = await this.executeQuery(request);
        return response.data;
    }


    /* *******************************************************************
                                CURATION METHODS
    *******************************************************************  */

    /**
     * Update the maintenanceRequest given the new status value. Requires admin right.
     * @param {Number} maintenanceRequest  ID of the maintenanceRequest to update
     * @param {string} newStatus - new status to update
     * @returns {Promise}
     */
    async updateStatusMaintenanceRequest(maintenanceRequest, newStatus){
        const request = {
            method: "put",
            baseURL: this.baseURL + "/maintenance_requests/" + maintenanceRequest,
            headers: this.headers,
            data: { maintenance_request: {status: newStatus}}
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }

    /**
     * Delete Record. Requires Admin right.
     * @param {Number} id - id of the record link to delete
     * @returns {Promise}
     */
    async deleteRecord(id){
        let _client = this;
        const request = {
            method: "delete",
            baseURL: _client.baseURL + "/fairsharing_records/" + id,
            headers: this.headers,
        };
        let response = await _client.executeQuery(request, true);
        return response.data;
    }

    /**
     * Get records without DOIS
     * @returns {Promise}
     */
    async getRecordsWoDOIs(){
        const request = {
            method: "get",
            baseURL: this.baseURL + "/files/no_dois",
        };
        let response = await this.executeQuery(request, true);
        return response.data;
    }


    /* *******************************************************************
                                OTHER METHODS
    *******************************************************************  */

    /**
     * Trigger the given query with Axios
     * @param {Object} query - the query to execute
     * @param {Boolean} mustBeLoggedIn - should the user be logged in before attempting to execute the query
     * @returns {Promise}
     */
    async executeQuery(query, mustBeLoggedIn = false) {
        if (mustBeLoggedIn) this.is_loggedIn()
        try {
            return await axios(query);
        }
        catch(e){
            return({data: {error: e}});
        }
    }
}

module.exports = (url, clientID) => {
    return new RESTClient(url, clientID)
}
