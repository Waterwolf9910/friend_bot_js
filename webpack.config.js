let rrt = require("react-refresh-typescript")
let rrwp = require("@pmmmwh/react-refresh-webpack-plugin")
let fs = require("fs")
let path = require("path")
let webpack = require("webpack")
let html = require("html-webpack-plugin")
let terser = require("terser-webpack-plugin")
let autoprefixer = require('autoprefixer')

let isDev = process.env.NODE_ENV == "development"

// No longer needed ;D
// let pagedir = path.resolve(__dirname, 'static_src', 'js', 'pages')
// fs.writeFileSync(path.resolve(__dirname, "static_src/js/pages/page_data.json"), JSON.stringify(fs.readdirSync(pagedir).filter(v => v.endsWith(".tsx")).map(v => v.replace(".tsx", ''))))

/**
 * @type {webpack.Configuration}
 */
let config = {
    //@ts-ignore
    entry: [ isDev && "webpack-hot-middleware/client?path=__hmr&dynamicPublicPath=true&reload=true", "./js/renderer.tsx" ].filter(v => typeof v != "boolean"),
    target: ["web", "es6"],
    stats: "normal",
    output: {
        path: path.resolve(__dirname, "build/static"),
        charset: true,
        publicPath: "auto",
        clean: true
    },
    context: path.resolve(__dirname, "static_src"),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    getCustomTransformers: () => ({
                        before: [ isDev && rrt.default() ].filter(v => typeof v != "boolean")
                    })
                }
            },
            {
                test: /\.(sc|c|sa)ss$/i,
                use: [/* "style-loader" *//* css.loader, */
                    {
                        loader: "css-loader",
                        options: {
                            // modules: {
                            //     mode: "global",
                            //     namedExport: true
                            // },
                            modules: false,
                            exportType: "css-style-sheet",
                            sourceMap: isDev
                        }
                    }, 
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer
                                ]
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: isDev,
                            sassOptions: {
                                fiber: false
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpeg|jpg|jpe|jfif|gif|webp|ico|tif|tiff|bmp)$/i,
                dependency: { not: [ 'url' ] },
                type: 'asset/resource'
            },
            {
                test: /\.txt$/,
                dependency: { not: [ 'url' ] },
                type: 'asset/source'
            },
            {
                test: /\.svg$/i,
                dependency: { not: [ 'url' ] },
                type: 'asset/inline'
            }
        ]
    },
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : false,
    plugins: (() => {
        /**
         * @type webpack.WebpackPluginInstance[]
         */
        let plugins = [
            new html({
                inject: "head",
                template: "./index.html",
                publicPath: "&{_path_}",
                minify: { removeComments: true }
            }),
            new webpack.ProgressPlugin({
                activeModules: true,
                dependencies: true,
                entries: true,
                modules: true,
                profile: true
                // handler: (a, b, ...c) => {console.log(a, b, ...c)}
            }),
        ]
        if (isDev) {
            plugins.push(
                new webpack.HotModuleReplacementPlugin(),
                new rrwp({ overlay: { sockIntegration: 'whm' } })
            )
        }
        return plugins
    })(),
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        extensionAlias: {
            '.ts': [ '.js', '.ts' ]
        },
        symlinks: false
    },
    resolveLoader: {
        plugins: [
        ]
    },
    optimization: isDev ? {} : {
        minimize: true,
        minimizer: [
            new terser({
                parallel: true,
                extractComments: true,
                terserOptions: {
                    sourceMap: false,
                    compress: {
                        booleans: true,
                        conditionals: true,
                        dead_code: true,
                        drop_debugger: true,
                        if_return: true,
                        join_vars: true,
                        keep_infinity: true,
                        loops: true,
                        negate_iife: false,
                        properties: false,
                        drop_console: true,
                    },
                    format: {
                        indent_level: 0,
                    }
                }
            })
        ],
        mangleExports: "size",
        providedExports: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        splitChunks: {
            chunks: "all",
        },
        concatenateModules: true,
    },
    experiments: {
        topLevelAwait: true
    }
}
module.exports = config

console.log("Building Web Assets")
