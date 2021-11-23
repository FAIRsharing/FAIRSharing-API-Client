/**
 * @jest-environment jsdom
 */
const client = require('../../index.js'),
    axios = require("axios");
let configuration = require('../../src/core/client.conf'),
    cache = require('../../src/core/cache'),
    processor = require('../../src/core/processor')
let endpoint = "example.com"

jest.mock("axios");

describe("FAIRSharing Client in the browser environment", () => {
    beforeEach(() => {
        client.setURL(endpoint)
    });

    it("can be casted correctly", () => {
        expect(configuration.baseURL).toBe(endpoint)
        expect(configuration.cacheEnabled).toBeFalsy()
        expect(configuration.cacheExpiry).toBe(24)
        expect(configuration.headers).toBeTruthy()
    })

    it("can set up a custom cache", () => {
        client.enableCache()
        expect(configuration.cacheEnabled).toBeTruthy()
        expect(configuration.cacheExpiry).toBe(24)
        client.disableCache()
        expect(configuration.cacheEnabled).toBeFalsy()
        expect(configuration.cacheExpiry).toBe(24)
        client.enableCache(1)
        expect(configuration.cacheEnabled).toBeTruthy()
        expect(configuration.cacheExpiry).toBe(1)
    })

    it("can set and delete an authentication token", () => {
        configuration.setAuthenticationHeaders("abc");
        expect(configuration.headers.Authorization).toBe('Bearer abc')
        configuration.setAuthenticationHeaders(null);
        expect(configuration.headers.Authorization).toBe(undefined)
    })

    it("can set and get some cached data", (done) => {
        client.disableCache()
        cache.setCachedData("test", "test")
        expect(cache.getCachedData("test")).toBe(null)
        client.enableCache(0.0001)
        cache.setCachedData("test", "test")
        expect(cache.getCachedData("test")).toBe("test")
        setTimeout(() => {
            expect(cache.getCachedData("test")).toBe(null)
            done()
        }, 400)

    })

    it("can check if a user is logged in or not", () => {
        const errorMessage = "Missing JWT. Please login first";
        configuration.setAuthenticationHeaders("123")
        expect(() => {
            return configuration.isLoggedIn()
        }).not.toThrow(errorMessage)
        configuration.setAuthenticationHeaders(null)
        expect(() => {
            return configuration.isLoggedIn()
        }).toThrow(errorMessage)
    })

    it("can validate tag types", () => {
        const errorMessage = "tag type should be one of countries, domains, subjects, user_defined_tags, taxonomies, " +
            "publications, record_types"
        configuration.setAuthenticationHeaders("123")
        expect(() => {
            return client.validateTagType("countries")
        }).not.toThrow(errorMessage)
        expect(() => {
            return client.validateTagType("test")
        }).toThrow(errorMessage)
    })

    it("can prepare a query", async () => {
        let query = {method: "get", baseURL: "abc.com"}
        let mockedServerData = { data: { message: "SUCCESS", jwt: "123" } }
        let mockedCachedData = {data: "this is fake data"}
        configuration.setAuthenticationHeaders("123")
        axios.mockImplementation(() => mockedServerData)
        let response = await processor.processQuery(query, true)
        expect(response).toStrictEqual(mockedServerData)
        client.enableCache()
        jest.spyOn(cache, "getCachedData").mockImplementation(() => { return null })
        response = await processor.processQuery(query)
        let cachedResponse = cache.getCachedData("abc.com")
        expect(cachedResponse).toBeNull()
        expect(mockedServerData).toStrictEqual(response)
        jest.spyOn(cache, "getCachedData").mockImplementation(() => { return mockedCachedData })
        response = await processor.processQuery(query)
        expect(response).toStrictEqual(mockedCachedData)

        jest.clearAllMocks()
        client.disableCache()
    })
})
