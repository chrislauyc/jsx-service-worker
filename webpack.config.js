const path = require("path");
const webpackPath = path.resolve(__dirname, "webpack");
module.exports = {
    mode: "production",
    entry: {
        "babel": path.resolve(webpackPath, "./babel.js"),
        "react": path.resolve(webpackPath, "./react.js"),
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].js"
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
};
