const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "production",
    entry: "./index.js",
    devtool: 'source-map',
    output: {
        path: __dirname + "/dist",
        filename: 'fairsharing.min.js',
        sourceMapFilename: 'fairsharing.min.map',
        library: {
            name: "fairsharingClient",
            type: "var"
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
