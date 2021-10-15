const client = require('../../index.js')
let endpoint = "example.com"

describe("FAIRSharing Client browserless", () => {
    beforeAll( () => { global.console.info = jest.fn() });
    beforeEach(() => { client.setURL(endpoint) });

    it("can log correctly the lack of localStorage", () => {
        const logMessage = "The cache relies on localStorage and thus is not supported in this environment."
        client.enableCache(1)
        expect(console.info.mock.calls[0]).toEqual([
            '\x1B[31m%s\x1B[0m',
            logMessage
        ])
    })
});
