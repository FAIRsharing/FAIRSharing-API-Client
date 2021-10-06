const RESTClient = require('../../index.js').default

describe("Client Constructor", () => {

    it("can be casted correctly", () => {
        let URL = "example.com"
        let client = RESTClient(URL)
        expect(client.baseURL).toBe(URL)
        expect(client.cacheEnabled).toBeFalsy()
        expect(client.cacheExpiry).toBe(24)
        URL = "example.2"
        let client2 = RESTClient(URL)
        expect(client2.baseURL).toBe(URL)
    })
})
