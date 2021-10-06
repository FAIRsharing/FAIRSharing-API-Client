/**
 * @jest-environment jsdom
 */
const RESTClient = require('../../index.js').default
let client;
let endpoint = "example.com"

describe("Client Constructor", () => {
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

})
