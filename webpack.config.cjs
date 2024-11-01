const path = require("path")
const analyser = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

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

    plugins: [
        new analyser({
            analyzerMode: "server",
            generateStatsFile: false,
            statsOptions: { source: false },
        }),
    ],
}
