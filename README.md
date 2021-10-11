[![Build](https://github.com/FAIRsharing/FAIRSharing-API-Client/actions/workflows/unit_tests.yml/badge.svg)](https://github.com/FAIRsharing/FAIRSharing-API-Client/actions/workflows/unit_tests.yml)
[![Documentation](https://api.netlify.com/api/v1/badges/edd1e884-83d9-46f4-902c-b4078c3acc22/deploy-status)](https://fairsharingapidoc.netlify.app)
[![Coverage Status](https://coveralls.io/repos/github/FAIRsharing/FAIRSharing-API-Client/badge.svg?branch=main)](https://coveralls.io/github/FAIRsharing/FAIRSharing-API-Client?branch=main)
[![CDN](https://img.shields.io/badge/CDN-netlify-success)](https://fairsharingapiclientcdn.netlify.app/index.js)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/caedac1ab73341759acc2b815aaff355)](https://www.codacy.com/gh/FAIRsharing/FAIRSharing-API-Client/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FAIRsharing/FAIRSharing-API-Client&amp;utm_campaign=Badge_Grade)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
![Project Status](https://img.shields.io/badge/status-alpha-orange)



# FAIRsharing-API-Client

The JavaScript client for the FAIRsharing API. Works with node, webpack and native JS.

## Usage

### 1 - Install 

#### a - From npm
```shell
npm install fairsharing-api-client
```

#### b - From source:
```shell
git clone https://github.com/FAIRsharing/FAIRSharing-API-Client.git
cd FAIRSharing-API-Client/
npm install
npm pack
```
You can then add the path to the .tgz generated by `npm pack` to the `package.json` file of your application:

```json
{
  "dependencies": {
    "fairsharing-api-client": "/path/to/fairsharing-api-client-0.0.1-alpha.0.tgz"
  }
}
```

#### c - From CDN
```html
<script type="application/javascript" src="https://fairsharingapiclientcdn.netlify.app/index.js">
</script>
<script type="module">
    let client = fairsharingClient('https://api.fairsharing.org');
</script>
```

###  2- In node or compiling with webpack:
```js
// import the client
const fairsharingClient = require("fairsharing-api-client")  
const server_url = "https://api.fairsharing.org"

// create the class by feeding it the URL of the API.
let client = fairsharingClient(server_url)

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

### 3 - In the browser:
```html
<!-- Import the transpiled code -->
<script type="application/javascript" src="./node_modules/fairsharing-api-client/dist/index.js">
</script>
<!-- Alternatively, you can use it directly from the CDN 
<script type="application/javascript" src="https://fairsharingapiclientcdn.netlify.app/index.js">
</script>
-->


<!-- Now, client is a function available through window.client() -->
<script type="module">
    const server_url = 'https://api.fairsharing.org'
    let client = fairsharingClient(server_url)
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

### 4- Development:

#### Building:
If you modify the source code, remember to rebuild the `dist/` directory using:
```shell
npm run build
```

#### Testing:
If you want to test the code using [`jest`](https://github.com/facebook/jest):
```shell
npm run test:unit
```

#### Local documentation:
If you want to generate the documentation locally using [`jsdoc`](https://github.com/jsdoc/jsdoc) 
and [`tui-jsdoc-template`](https://github.com/nhn/tui.jsdoc-template):
```shell
npm run doc
```
The configuration file for the documentation in is [`/doc/doc.conf.js`](https://github.com/FAIRsharing/FAIRSharing-API-Client/tree/main/doc)
