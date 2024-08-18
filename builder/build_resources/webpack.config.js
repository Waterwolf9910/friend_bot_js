let fs = require("fs");
let path = require("path");
let webpack = require("webpack");
let isDev = process.env.NODE_ENV == "development";

/**
 * @type {webpack.Configuration}
 */
let server_config = {
    entry: ["./libs/fs.ts", "./index.ts"],
    context: path.resolve(__dirname, "../../app/src"),
    devtool: isDev ? "inline-source-map" : false,
    output: {
        path: path.resolve(__dirname, "../out"),
        filename: "index.js",
        clean: true,
    },
    stats: {
        errorDetails: true
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                loader: 'ts-loader',
                options: {
                    // configFile: "../tsconfig.json"
                }
            },
            {
                test: /\.node$/,
                loader: path.resolve(__dirname, "./native_loader/loader.js")
            }
        ]
    },
    ignoreWarnings: [/.*/],
    // externals: ['./Find-VisualStudio.cs'],
    externalsPresets: {
        node: true
    },
    plugins: (() => 
        [
            ...(isDev ? [
                new webpack.SourceMapDevToolPlugin({
                    // sourceRoot: '../../',
                    moduleFilenameTemplate: '../../app/src/[namespace]/[resourcePath]',
                    // sourceRoot: path.resolve(__dirname, "../../app/src/[namespace]/[resourcePath]"),
                })
            ] : [])
        ]
    )(),
    optimization: {
        chunkIds: 'named',
        moduleIds: 'named',
        minimize: false,
        // removeEmptyChunks: false,
        // mergeDuplicateChunks: false,
        // concatenateModules: false,
        // mangleExports: false,
        // removeAvailableModules: false,
        // providedExports: false,
        // sideEffects: false,
        // usedExports: false,
        // splitChunks: false,

    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        // extensionAlias: {
        //     ".ts": [".js", ".ts"],
        // },
    },
    name: "main",
    target: "node",
    mode: isDev ? 'development' : 'production'
}

let client_config = require("./webpack.static.config")


module.exports = [server_config, client_config];

module.exports.parallelism = 2;
