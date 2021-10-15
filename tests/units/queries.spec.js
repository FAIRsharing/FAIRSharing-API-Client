import methods from "./methods.json"
import axios from "axios";
const client = require('../../index.js');
let configuration = require('../../src/core/client.conf'),
    endpoint = "https://example.com"
jest.mock("axios");

describe("FAIRSharing Client queries", () => {
    beforeEach(() => {
        client.setURL(endpoint)
    });

    afterEach( () => {
        configuration.setAuthenticationHeaders(null)
        jest.clearAllMocks();
    })

    it("can login/logout a user", async () => {
        let mockedData = { data: { message: "SUCCESS", jwt: "123" } }
        axios.mockImplementation(() => mockedData)
        let response = await client.login("username", "password");
        expect(configuration.headers.Authorization).toBe("Bearer 123")
        expect(response).toBe(mockedData)
        response = await client.logout()
        expect(configuration.headers.Authorization).toBe(undefined)
        expect(response).toBe(mockedData)
        jest.clearAllMocks();
        axios.mockImplementation(() => { return {data: {error: "Not authorized"}} })
        response = await client.login("username", "password");
        expect(response).toStrictEqual({data: {error: "Not authorized"}})
        expect(configuration.headers.Authorization).toBe(undefined)
    })

    it("can validate a token", async () => {
        configuration.setAuthenticationHeaders("123")
        let mockedData = { data: { message: "SUCCESS", jwt: "123", success: true } }
        axios.mockImplementation(() => mockedData)
        let response = await client.validateToken()
        expect(response).toStrictEqual(mockedData)
        expect(configuration.headers.Authorization).toBe("Bearer 123")
        mockedData = { data: { message: "SUCCESS", jwt: "123", success: false } }
        response = await client.validateToken()
        expect(response).toStrictEqual(mockedData)
        expect(configuration.headers.Authorization).toBeUndefined()
    })

    it("can execute bunch of queries", async () => {
        configuration.setAuthenticationHeaders("123")
        let mockedData = { message: "SUCCESS", jwt: "123" }
        axios.mockImplementation(() => mockedData)
        // jest.spyOn(client, "executeQuery").mockImplementation(() => { return mockedData })
        let response;
        for (const methodName in methods) {
            const methodArgs = methods[methodName]
            if (methodArgs) response = await client[methodName](methodArgs)
            else response = await client[methodName]()
            expect(response.data).toStrictEqual(mockedData)
        }
        response = await client.getCountries();
        expect(response.data).toStrictEqual(mockedData)
    })

    it("can search records", async () => {
        configuration.setAuthenticationHeaders("123")
        let mockedData = { message: "SUCCESS" }
        let query = {
            q: "GenBank"
        }
        axios.mockImplementation(() => mockedData)
        let response = await client.searchRecords(query)
        expect(response.data).toStrictEqual({ message: 'SUCCESS' })
        query.page = 1
        query.perPage = 10
        response = await client.searchRecords(query)
        expect(response.data).toStrictEqual({ message: 'SUCCESS' })
        response = await client.searchRecords()
        expect(response.data).toStrictEqual({ message: 'SUCCESS' })
    })
})
