/**
 * @jest-environment jsdom
 */
const RESTClient = require('../../index.js').default
let client;
let endpoint = "example.com"

describe("FAIRSharing Client with a browser", () => {
    beforeEach(() => {
        client = RESTClient(endpoint)
    });

    it("can be casted correctly", () => {
        expect(client.baseURL).toBe(endpoint)
        expect(client.cacheEnabled).toBeFalsy()
        expect(client.cacheExpiry).toBe(24)
        expect(client.headers).toBeTruthy()
        endpoint = "example.2"
        let client2 = RESTClient(endpoint)
        expect(client2.baseURL).toBe(endpoint)
        expect(client.headers).toBeTruthy()
    })

    it("can set up a custom cache", () => {
        client.enableCache()
        expect(client.cacheEnabled).toBeTruthy()
        expect(client.cacheExpiry).toBe(24)
        client.disableCache()
        expect(client.cacheEnabled).toBeFalsy()
        expect(client.cacheExpiry).toBe(24)
        client.enableCache(1)
        expect(client.cacheEnabled).toBeTruthy()
        expect(client.cacheExpiry).toBe(1)
    })

    it("can generate an expiration token", () => {
        let timer = 12
        client.enableCache(12)
        const  now = new Date(new Date()).getTime();
        const date = client.generateExpirationDate()
        expect(date - now).toBe(timer*60*60*1000)
    })

    it("can set and delete an authentication token", () => {
        client.set_authentication_headers("abc");
        expect(client.headers.Authorization).toBe('Bearer abc')
        client.set_authentication_headers(null);
        expect(client.headers.Authorization).toBe(undefined)
    })

    it("can set and get some cached data", (done) => {
        client.disableCache()
        client.setCachedData("test", "test")
        expect(client.getCachedData("test")).toBe(null)
        client.enableCache(0.0001)
        client.setCachedData("test", "test")
        expect(client.getCachedData("test")).toBe("test")
        setTimeout(() => {
            expect(client.getCachedData("test")).toBe(null)
            done()
        }, 400)

    });

    it("can check if a user is logged in or not", () => {
        const errorMessage = "Missing JWT. Please login first";
        client.set_authentication_headers("123")
        expect(() => {
            return client.is_loggedIn()
        }).not.toThrow(errorMessage)
        client.set_authentication_headers(null)
        expect(() => {
            return client.is_loggedIn()
        }).toThrow(errorMessage)
    })

    it("can validate tag types", () => {
        const errorMessage = "tag type should be one of countries, domains, subjects, user_defined_tags, taxonomies, " +
            "publications, record_types"
        client.set_authentication_headers("123")
        expect(() => {
            return client.validate_tag_type("countries")
        }).not.toThrow(errorMessage)
        expect(() => {
            return client.validate_tag_type("test")
        }).toThrow(errorMessage)
    })

})
