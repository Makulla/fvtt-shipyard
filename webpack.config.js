const path = require("path");

module.exports = {
    entry: "./tsc/boatyface.js",
    mode: "none",
    output: {
        path: path.resolve(__dirname, "dist/scripts"),
        filename: "script.js"
    },
    module: {
        rules: [
            { 
                test: /\.handlebars$/, 
                loader: "handlebars-loader" 
            }
        ]
    }
};