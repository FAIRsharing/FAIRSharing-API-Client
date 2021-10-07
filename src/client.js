const axios = require('axios')

class RESTClient {

    /**
     * The RESTClient is a singleton class that handles the connection and data exchange from the back-end
     * REST API.
     */
    constructor(url){
        if (RESTClient._instance){
            RESTClient._instance.baseURL = url;
            return RESTClient._instance;
        }
        RESTClient._instance = this;
        this.clearCache()
        this.baseURL = url;
        this.cacheEnabled = false;
        this.cacheExpiry = 24;
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
            data:body,
            headers: this.headers
        };
        let response = await this.processQuery(request);
        if (!response.error){
            console.log(response)
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
        let response = await this.processQuery(request);
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
            data:{user: userAccount},
            headers: this.headers
        };
        let response = await this.processQuery(request);
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
        let response = await this.processQuery(request);
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
            data:{
                user: {email: email}
            }
        };
        let response = await this.processQuery(request);
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
            data:{user: user}
        };
        let response = await this.processQuery(request);
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
            data:{user: user}
        };
        let response = await this.processQuery(request);
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
            data:{user: user}
        };
        let response = await this.processQuery(request, true);
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
            data:{password: password}
        };
        let response = await this.processQuery(request);
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
        let response = await this.processQuery(request, true);
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
        let response = await this.processQuery(request, true);
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
        let response = await this.processQuery(request);
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
            data:{user: newUser}
        };
        let response = await this.processQuery(request, true);
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
            data:{user: newUser}
        };
        let response = await this.processQuery(request, true);
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
        let response = await this.processQuery(request, true);
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
        let response = await this.processQuery(request, true);
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
            data:{fairsharing_record: record}
        };
        let response = await this.processQuery(request, true);
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
            data:{fairsharing_record: record}
        };
        let response = await this.processQuery(request, true);
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
        let response = await this.processQuery(request, true);
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
            data:{maintenance_request: {fairsharing_record_id: recordID}}
        };
        let response = await this.processQuery(request, true);
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
        let response = await this.processQuery(request, true);
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
            data:{record_review: {fairsharing_record_id: recordID}}
        };
        let response = await this.processQuery(request, true);
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
            data:{user_defined_tag: {label:term}}
        };
        let response = await this.processQuery(request, true);
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
            data:{licence_link: licenceLink}
        };
        let response = await _client.processQuery(request, true);
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
        let response = await _client.processQuery(request, true);
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
            data:{licence_link: licenceLink}
        };
        let response = await _client.processQuery(request, true);
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
            data:{ publication: publication }
        };
        let response = await this.processQuery(request, true);
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
            data:{ publication: publication }
        };
        let response = await this.processQuery(request, true);
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
            data:{fairsharing_record: {record_associations_attributes: relations}}
        };
        let response = await this.processQuery(request, true);
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
            data:{ organisation: organisation }
        };
        let response = await this.processQuery(request, true);
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
            data:{ grant: grant }
        };
        let response = await this.processQuery(request, true);
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
            data:{ organisation_link: organisationLink }
        };
        let response = await _client.processQuery(request, true);
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
            data:{ organisation_link: organisationLink }
        };
        let response = await this.processQuery(request, true);
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
        let response = await _client.processQuery(request, true);
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
            data:{type: type}
        };
        let response = await this.processQuery(request, true);
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
        let response = await _client.processQuery(request);
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
        let response = await this.processQuery(request);
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
            data:{ maintenance_request: {status: newStatus}}
        };
        let response = await this.processQuery(request, true);
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
        let response = await _client.processQuery(request, true);
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
        let response = await this.processQuery(request, true);
        return response.data;
    }

    /**
     * Get the current record
     * @param {Number} recordID - id of the record to get
     * @returns {Promise}
     */
    async getRecord(recordID){
        const request = {
            method: "get",
            baseURL: `${this.baseURL}/fairsharing_records/${recordID}`,
            headers: this.headers
        };
        let response = await this.processQuery(request, true);
        return response.data;
    }

    /**
     * Validates the tag type against allowed types
     * @param {String} tagType
     */
    validate_tag_type(tagType) {
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
     * Search the countries
     * @param {String} tagType - the type of tag to search for (eg. countries, domains, subjects, ...)
     * @param {String} query - an optional query string
     * @returns {Promise}
     */
    async searchTags(tagType, query= null) {
        this.validate_tag_type(tagType);
        const body = query ? {q: query} : {};
        const request = {
            method: "post",
            baseURL: `${this.baseURL}/search/${tagType}`,
            headers: this.headers,
            data:body
        };
        let response = await this.processQuery(request, true);
        return response.data
    }

    /**
     * Helper to get countries
     * @param {String} query - optional query string
     * @returns {Promise}
     */
    async getCountries(query = null) { return await this.searchTags("countries", query) }

    /**
     * Helper to get domains
     * @param {String} query - optional query string
     * @returns {Promise<*>}
     */
    async getDomains(query = null) { return await this.searchTags("domains", query) }

    /**
     * Helper to get subjects
     * @param {String} query - optional query string
     * @returns {Promise<*>}
     */
    async getSubjects(query = null) { return await this.searchTags("subjects", query) }

    /**
     * Helper to get user defined tags
     * @param {String} query - optional query string
     * @returns {Promise<*>}
     */
    async getUserDefinedTags(query = null) { return await this.searchTags("user_defined_tags", query) }

    /**
     * Helper to get taxonomies terms
     * @param {String} query - optional query string
     * @returns {Promise<*>}
     */
    async getTaxonomies(query = null) { return await this.searchTags("taxonomies", query) }

    /**
     * Helper to get publications
     * @param {String} query - optional query string
     * @returns {Promise<*>}
     */
    async getPublications(query) { return await this.searchTags("publications", query) }

    /**
     * Helper to get recordTypes
     * @returns {Promise<*>}
     */
    async getRecordTypes() { return await this.searchTags("record_types") }

    /**
     * Get the given tag type
     * @param tagType
     * @param tagID
     * @returns {Promise<*>}
     */
    async getTag(tagType, tagID) {
        this.validate_tag_type(tagType)
        const request = {
            method: "get",
            baseURL: `${this.baseURL}/${tagType}/${tagID}`,
            headers: this.headers,
        };
        let response = await this.processQuery(request, true);
        return response.data
    }

    /**
     * Helper to get a country
     * @param {Number} countryID - ID of the country to get
     * @returns {Promise<*>}
     */
    async getCountry(countryID) { return await this.getTag("countries", countryID)}

    /**
     * Helper to get a domain
     * @param {Number} domainID - ID of the domain to get
     * @returns {Promise<*>}
     */
    async getDomain(domainID) { return await this.getTag("domains", domainID) }

    /**
     * Helper to get a subject
     * @param {Number} subjectID - ID of the subject to get
     * @returns {Promise<*>}
     */
    async getSubject(subjectID) { return await this.getTag("subjects", subjectID) }

    /**
     * Helper to get a user defined tag
     * @param {Number} tagID - ID of the user defined tag to get
     * @returns {Promise<*>}
     */
    async getUserDefinedTag(tagID) { return await this.getTag("user_defined_tags", tagID) }

    /**
     * Helper to get a user taxonomy term
     * @param {Number} speciesID - ID of the taxonomy term to get
     * @returns {Promise<*>}
     */
    async getSpecies(speciesID) { return await this.getTag("user_defined_tags", speciesID) }

    /**
     * Helper to get a user taxonomy term
     * @param {Number} taxonID - ID of the taxonomy term to get
     * @returns {Promise<*>}
     */
    async getTaxon(taxonID) { return await this.getTag("taxonomies", taxonID) }

    /**
     * Helper to get a publication
     * @param {Number} pubID - ID of the pbulication to get
     * @returns {Promise<*>}
     */
    async getPublication(pubID) {return await this.getTag("user_defined_tags", pubID) }

    /**
     * Search FAIRsharing records
     * @param {Object} query - optional query string
     * @returns {Promise<*>}
     */
    async searchRecords(query = {}) {
        const body = query.q ? {q: query.q} : {};
        const baseURL = new URL("/search/fairsharing_records", this.baseURL)
        if (query.page) baseURL.searchParams.set("page[number]", query.page)
        if (query.perPage) baseURL.searchParams.set("page[size]", query.perPage)
        const request = {
            method: "post",
            baseURL: baseURL.href,
            headers: this.headers,
            data:body
        };
        let response = await this.processQuery(request, true);
        return response.data
    }


    /* *******************************************************************
                            CACHE AND OTHER METHODS
    *******************************************************************  */

    /**
     * Process the query and either get the data from the cache or execute the axios request
     * @param {Object} query - the query to execute
     * @param {Boolean} mustBeLoggedIn - should the user be logged in before attempting to execute the query
     * @returns {Promise}
     */
    async processQuery(query, mustBeLoggedIn = false) {
        if (mustBeLoggedIn) this.is_loggedIn()
        try {
            const URL = query.baseURL;
            let response = null;
            if (query.method === "get" && this.cacheEnabled) {
                response = this.getCachedData(URL)
            }
            if (!response) {
                response = await this.executeQuery(query);
                if (query.method === "get" && this.cacheEnabled) {
                    this.setCachedData(URL, response)
                }
            }
            return (response.data) ? response : {data: response}
        }
        catch(e){
            return({data: { error: e }});
        }
    }

    /**
     * Wrapper for easier axios mocks
     * @param query
     * @returns {Promise}
     */
    async executeQuery(query){ return axios(query) }

    /**
     * Build the cache using local storage
     */
    clearCache(){
        if (storageAvailable()) {
            localStorage.setItem("requestsCache", JSON.stringify({}));
        }
    }

    /**
     * Given a query url tries to find it in the cache.
     * @param {String} URL
     * @returns {Object|null}
     */
    getCachedData(URL) {
        let cache = localStorage.getItem("requestsCache")
        cache = cache ? JSON.parse(cache) : {}
        let data =  cache[URL] ? cache[URL] : null
        if (data && data['expiry'] && this.cacheEnabled) {
            data = new Date().getTime() > new Date(data['expiry']).getTime() ? null : data
        }
        return (data && data.data) ? data.data : null
    }

    /**
     * Write the current response in the local storage
     * @param {String} url - a URL representing the GET query
     * @param {Object} response - the response object received from the server
     */
    setCachedData(url, response) {
        if (this.cacheEnabled) {
            let cache = JSON.parse(localStorage.getItem("requestsCache"))
            let data = {data: response}
            data.expiry = this.generateExpirationDate()
            cache[url] = data
            localStorage.setItem("requestsCache", JSON.stringify(cache))
        }
    }

    /**
     * Method to enable cached data
     * @param {Number} timer - Time in hours after which the cached data will expire.
     */
    enableCache(timer = 24){
        if (storageAvailable()) {
            this.cacheEnabled = true
            this.cacheExpiry = timer
        }
        else console.info("The cache relies on localStorage and thus is not supported in this environment.")
    }

    /**
     * Method to disable cached data
     */
    disableCache() {
        this.cacheEnabled = false
        this.cacheExpiry = 24
    }

    /**
     * Generate an expiration date based on the now + expiration timer
     * @returns {Date}
     */
    generateExpirationDate() {
        return new Date(new Date().getTime() + (this.cacheExpiry * 60 * 60 * 1000))
    }
}


/**
 * Test if there's an available localStorage before accessing it.
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

export default function client(url) {
    return new RESTClient(url)
}
