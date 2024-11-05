// cp ~/storage/downloads/code/bundler/* . && npm run webpack && cp index.js ~/storage/downloads/code/bundler/index.js

const path = require("path");
//const webpack = require("webpack");
module.exports = {
    //mode: "development",
    mode: "production",
    entry: "./index.ts",
    output: {
        path: path.resolve(__dirname, "."),
        filename: "index.js"
        // library: {
        //     // do not specify a `name` here
        //     type: "module"
        // }
    },
    resolve: {
        fallback: {
            path: false,
            assert: false,
            fs: false
        }
        // alias: {
        //     "@babel/helper-plugin-utils": path.resolve(
        //         __dirname,
        //         "babel-helper-plugin-utils.ts"
        //     )
        // }
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                // use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    }
    // plugins: [
    //     new webpack.ProvidePlugin({
    //         process: {
    //             env: {}
    //         }
    //     })
    // ]
    // experiments: {
    //     outputModule: true
    // }
};
