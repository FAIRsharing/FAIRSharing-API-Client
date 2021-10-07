const RESTClient = require('../../index.js').default
let client;
let endpoint = "example.com"

describe("FAIRSharing Client queries", () => {
    beforeEach(() => {
        client = RESTClient(endpoint)
    });

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
})
