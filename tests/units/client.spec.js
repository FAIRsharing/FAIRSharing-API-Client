/**
 * @jest-environment jsdom
 */
const RESTClient = require('../../index.js')
let client;
let endpoint = "example.com"

describe("FAIRSharing Client in the browser environment", () => {
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
        client.setAuthenticationHeaders("abc");
        expect(client.headers.Authorization).toBe('Bearer abc')
        client.setAuthenticationHeaders(null);
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

    })

    it("can check if a user is logged in or not", () => {
        const errorMessage = "Missing JWT. Please login first";
        client.setAuthenticationHeaders("123")
        expect(() => {
            return client.isLoggedIn()
        }).not.toThrow(errorMessage)
        client.setAuthenticationHeaders(null)
        expect(() => {
            return client.isLoggedIn()
        }).toThrow(errorMessage)
    })

    it("can validate tag types", () => {
        const errorMessage = "tag type should be one of countries, domains, subjects, user_defined_tags, taxonomies, " +
            "publications, record_types"
        client.setAuthenticationHeaders("123")
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
        jest.spyOn(client, "executeQuery").mockImplementation(() => { return mockedServerData })
        client.setAuthenticationHeaders("123")
        let response = await client.processQuery(query, true)
        expect(response).toStrictEqual(mockedServerData)
        client.enableCache()
        jest.spyOn(client, "getCachedData").mockImplementation(() => { return null })
        response = await client.processQuery(query)
        let cachedResponse = client.getCachedData("abc.com")
        expect(cachedResponse).toBeNull()
        expect(mockedServerData).toStrictEqual(response)
        jest.spyOn(client, "getCachedData").mockImplementation(() => { return mockedCachedData })
        response = await client.processQuery(query)
        expect(response).toStrictEqual(mockedCachedData)

        jest.clearAllMocks()
        client.disableCache()
    })
})
