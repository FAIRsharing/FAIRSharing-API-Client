[![Build](https://github.com/FAIRsharing/FAIRSharing-API-Client/actions/workflows/unit_tests.yml/badge.svg)](https://github.com/FAIRsharing/FAIRSharing-API-Client/actions/workflows/unit_tests.yml)
[![Documentation](https://api.netlify.com/api/v1/badges/edd1e884-83d9-46f4-902c-b4078c3acc22/deploy-status)](https://fairsharingapidoc.netlify.app)
[![Coverage Status](https://coveralls.io/repos/github/FAIRsharing/FAIRSharing-API-Client/badge.svg?branch=main)](https://coveralls.io/github/FAIRsharing/FAIRSharing-API-Client?branch=main)
[![CDN](https://img.shields.io/badge/CDN-netlify-success)](https://fairsharingapiclientcdn.netlify.app/index.js)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/caedac1ab73341759acc2b815aaff355)](https://www.codacy.com/gh/FAIRsharing/FAIRSharing-API-Client/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FAIRsharing/FAIRSharing-API-Client&amp;utm_campaign=Badge_Grade)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/Naereen/badges/)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
![Project Status](https://img.shields.io/badge/status-alpha-orange)



# FAIRsharing-API-Client

The JavaScript client for the FAIRsharing API. Works with node, webpack and native JS.

## Usage

1 - Install from npm
``` 
npm install fairsharing-api-client
```

2- In node or compiling with webpack:
```js
// import the client
const fairsharingClient = require("fairsharing-api-client")  
const URL = "https://api.fairsharing.org"

// create the class by feeding it the URL of the API.
let client = fairsharingClient(URL)

// Login with a promise
client.login("user", "password").then(async () => {
    // You can now execute all query asynchronously
    let types = await client.getTaxon(12);
    console.log(types)
    // Logout after you are done
    await client.logout();
})
```
You can then transpile this code with webpack to make it available in the browser or execute it with node.

3 - In the browser:
```html
<!-- Import the transpiled code -->
<script type="application/javascript" src="./node_modules/fairsharing-api-client/dist/index.js">
</script>
<!-- Now, client is a function available through window.client() -->
<script type="module">
    const URL = 'https://api.fairsharing.org'
    let client = fairsharingClient(URL)
    // When in the browser you can enable a cache that relies on the localStorage
    // The input is a timer in hours, default to 24 if none is given
    client.enableCache(1)

    client.login("user", "password").then(async () => {
        // First request hits the servers
        let types = await client.getTaxon(12);
        console.log(types)
        // Second request hits the cache
        types = await client.getTaxon(12);
        console.log(types)
        // Logout and clear the cache when you are done
        await client.logout();
        client.clearCache();
    })
</script>
```
