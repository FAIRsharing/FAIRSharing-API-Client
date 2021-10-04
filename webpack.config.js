const path = require("path");

module.exports = {
    mode: "development",
    module: {
        rules: [{
            loader: "babel-loader",
            exclude: [path.resolve(__dirname, "node_modules")],
            test: /\.jsx?$/,
        }]
    },
    output: {
        path: __dirname,
        filename: './dist/index.js',
        library: "fairsharing-client-api",
        libraryTarget: "commonjs"
    }
};
