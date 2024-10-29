const path = require("path")

module.exports = {
    entry: path.resolve(__dirname, "client", "index.js"),
    mode: "production",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "client"),
    },

    devServer: {
        static: "./client",
        port: 9000,
    },
}
