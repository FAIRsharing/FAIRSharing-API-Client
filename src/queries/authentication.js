let clientConfiguration = require("../core/client.conf")
let processQuery = require("../core/processor").processQuery

/**
 * Method to log in the user and set the JWT into the headers
 * @example
 * RESTClient.login({username: "username", password: "password"}).then((res) => {console.log(RESTClient.headers.Authorization)})
 * @param username - name of the user
 * @param password - password of the user
 * @return {Promise} - the response of the server
 */
module.exports.login = async (username, password) => {
    let response = await processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/users/sign_in",
        headers: clientConfiguration.headers,
        data: {
            user: {
                login: username,
                password: password
            }
        }
    });
    if (!response.data.error) {
        clientConfiguration.userID = response.data.id;
        clientConfiguration.setAuthenticationHeaders(response.data['jwt']);
    }
    return response;
}

/**
 * Logout the user from the backend, expiring the current jwt.
 * @example
 * RESTClient.logout().then((res) => {console.log(res)})
 * @returns {Promise}
 */
module.exports.logout = async () => {
    let response = await processQuery({
        method: "delete",
        baseURL: clientConfiguration.baseURL + "/users/sign_out",
        headers: clientConfiguration.headers
    });
    clientConfiguration.setAuthenticationHeaders(null)
    return response
}

/**
 * Method to create a new user
 * @example
 * RESTClient.createAccount({username: "username", email: "email@example.com", password: "pwd", repeatPassword: "pwd"}).then((res) => {console.log(res)})
 * @param {Object} userAccount - the user account to create
 * @returns {Promise} response - server response
 */
module.exports.createAccount = (userAccount) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/users",
        data: {user: userAccount},
        headers: clientConfiguration.headers
    });
}

/**
 * Validate the account given the corresponding token received in the email
 * @example
 * RESTClient.confirmAccount({token: "tokenFromEmail"}).then((res) => { console.log(res) })
 * @param {String} token - the account token to validate
 * @returns {Promise}
 */
module.exports.confirmAccount = (token) => {
    return processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + "/users/confirmation?confirmation_token=" + token,
        headers: clientConfiguration.headers,
    });
}

/**
 * Method to send a reset password link to the given email address
 * @example
 * RESTClient.requestResetPwd({email: "email@exmaple.com"}).then((res) => { console.log(res) })
 * @param {String} email to send the link to
 * @returns {Promise}
 */
module.exports.requestResetPwd = (email) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/users/password",
        headers: clientConfiguration.headers,
        data: {
            user: {email: email}
        }
    });
}

/**
 * Resend the validation link for a given user
 * @param {Object} user - contains the email of the user.
 * @returns {Promise}
 * @example
 * RESTClient.resendConfirmation({email: "example@email.com"}).then((res) => {console.log(res)});
 */
module.exports.resendConfirmation = (user) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/users/confirmation",
        headers: clientConfiguration.headers,
        data: {user: user}
    });
}

/**
 * Reset the password of the given user
 * @param {Object} user - contains the new pwd, repeated pwd and token received in the email.
 * @returns {Promise}
 * @example
 * RESTClient.resetPassword({password: "pwd", repeatPassword: "pwd", token: "ExtractFromEmail"}).then((res) => {console.log(res)});
 */
module.exports.resetPassword = (user) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration.baseURL + "/users/password",
        headers: clientConfiguration.headers,
        data: {user: user}
    });
}

/**
 * Changes the password of the logged in user
 * @param {Object} user - contains the current, new and repeated new password
 * @returns {Promise}
 *
 */
module.exports.resetPasswordWithoutToken = (user) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration.baseURL + "/users/",
        headers: clientConfiguration.headers,
        data: {user: user}
    }, true);
}

/**
 * Verify the given password is strong enough
 * @param {String} password - the password to test
 * @returns {Promise}
 */
module.exports.verifyPassword = (password) => {
    return processQuery({
        method: "post",
        baseURL: clientConfiguration.baseURL + "/users/check_password",
        headers: clientConfiguration.headers,
        data: {password: password}
    });
}

/**
 * Edit the current logged in user profile
 * @param {Object} newUser - the new values for the logged in user
 * @returns {Promise}
 */
module.exports.editMyself = (newUser) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration.baseURL + "/users",
        headers: clientConfiguration.headers,
        data: {user: newUser}
    }, true);
}

/**
 * Edit the given user profile. Requires Admin rights.
 * @param {Object} newUser - the new values for the user to edit.
 * @returns {Promise}
 */
module.exports.editUser = (newUser) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration.baseURL + `/user_admin/${newUser.id}`,
        headers: clientConfiguration.headers,
        data: {user: newUser}
    }, true);
}

/**
 * Delete the user
 * @param userID - the ID of the user to delete. Requires Admin rights.
 * @returns {Promise}
 */
module.exports.deleteUser = (userID) => {
    return processQuery({
        method: "delete",
        baseURL: clientConfiguration.baseURL + `/user_admin/${userID}`,
        headers: clientConfiguration.headers,
    }, true);
}

/**
 * Verify that the given JWT is still valid
 * @returns {Promise}
 */
module.exports.validateToken = async () => {
    let response = await processQuery({
        method: "get",
        baseURL: clientConfiguration.baseURL + "/users/valid",
        headers: clientConfiguration.headers
    }, true);
    if (!response.data.success) clientConfiguration.setAuthenticationHeaders(null)
    return response;
}

/**
 * Binds a list of organisations to the current user
 * @param {Array<Number>} organisationsIDs - a list of organisations IDs
 * @example
 * client.bindOrganisationsToUser([1, 2]).then((res) => { console.log(res) });
 * @returns {Promise}
 */
module.exports.bindOrganisationsToUser = (organisationsIDs) => {
    return processQuery({
        method: "put",
        baseURL: clientConfiguration.baseURL + "/users",
        headers: clientConfiguration.headers,
        data: {
            id: clientConfiguration.userID,
            organisation_ids: organisationsIDs
        }
    });
}
