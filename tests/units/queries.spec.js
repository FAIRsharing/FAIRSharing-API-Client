const RESTClient = require('../../index.js')
import methods from "./methods.json"

let client;
let endpoint = "https://example.com"

async function executeMethodByName(functionName, context /*, args */) {
    let args = Array.prototype.slice.call(arguments, 2);
    let namespaces = functionName.split(".");
    let func = namespaces.pop();
    for(let i = 0; i < namespaces.length; i++) context = context[namespaces[i]];
    return await context[func].apply(context, args);
}

describe("FAIRSharing Client queries", () => {
    beforeEach(() => {
        client = RESTClient(endpoint)
    });

    afterEach( () => {
        client.set_authentication_headers(null)
        jest.clearAllMocks();
    })

    it("can login/logout a user", async () => {
        let mockedData = { data: { message: "SUCCESS", jwt: "123" } }
        jest.spyOn(client, "executeQuery").mockImplementation(() => { return mockedData })
        let response = await client.login("username", "password");
        expect(client.headers.Authorization).toBe("Bearer 123")
        expect(response).toBe(mockedData.data)
        response = await client.logout()
        expect(client.headers.Authorization).toBe(undefined)
        expect(response).toBe(mockedData.data)
        jest.clearAllMocks();
        jest.spyOn(client, "executeQuery").mockImplementation(() => {
            return {data: {error: "Not authorized"}}
        })
        response = await client.login("username", "password");
        expect(response).toStrictEqual({error: "Not authorized"})
        expect(client.headers.Authorization).toBe(undefined)
    })

    it("can validate a token", async () => {
        client.set_authentication_headers("123")
        let mockedData = { data: { message: "SUCCESS", jwt: "123", success: true } }
        jest.spyOn(client, "executeQuery").mockImplementation(() => { return mockedData })
        let response = await client.validateToken()
        expect(response).toStrictEqual(mockedData.data)
        expect(client.headers.Authorization).toBe("Bearer 123")
        mockedData = { data: { message: "SUCCESS", jwt: "123", success: false } }
        response = await client.validateToken()
        expect(response).toStrictEqual(mockedData.data)
        expect(client.headers.Authorization).toBeUndefined()
    })

    it("can execute bunch of queries", async () => {
        client.set_authentication_headers("123")
        let mockedData = { message: "SUCCESS", jwt: "123" }
        jest.spyOn(client, "executeQuery").mockImplementation(() => { return mockedData })

        let response;
        for (const methodName in methods) {
            const methodArgs = methods[methodName]
            if (methodArgs) response = await executeMethodByName(methodName, client, methodArgs)
            else response = await executeMethodByName(methodName, client)
            expect(response).toStrictEqual(mockedData)
        }
        response = await client.getCountries();
        expect(response).toStrictEqual(mockedData)
    })

    it("can search records", async () => {
        client.set_authentication_headers("123")
        let mockedData = { message: "SUCCESS" }
        let query = {
            q: "GenBank"
        }
        jest.spyOn(client, "executeQuery").mockImplementation(() => { return mockedData })
        let response = await client.searchRecords(query)
        expect(response).toStrictEqual({ message: 'SUCCESS' })
        query.page = 1
        query.perPage = 10
        response = await client.searchRecords(query)
        expect(response).toStrictEqual({ message: 'SUCCESS' })
        response = await client.searchRecords()
        expect(response).toStrictEqual({ message: 'SUCCESS' })
    })
})
