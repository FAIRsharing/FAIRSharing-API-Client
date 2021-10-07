const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./index.js",
    module: {
        rules: [{
            loader: "babel-loader",
            exclude: [path.resolve(__dirname, "node_modules")],
            test: /\.jsx?$/,
        }],
    },
    output: {
        path: __dirname,
        filename: './dist/index.js',
        library: "client",
        libraryTarget: "window",
        libraryExport: 'default',
    },
    resolve: {
        alias: {
            client: path.resolve(__dirname, 'src/client.js')
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            })
        ]
    }
};
