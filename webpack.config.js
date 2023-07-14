let fs = require("fs")
let path = require("path")
let webpack = require("webpack")
let html = require("html-webpack-plugin")
let css = require("mini-css-extract-plugin")
let terser = require("terser-webpack-plugin")
let os = require('os')
// let copy = require("copy-webpack-plugin")

/**
 * 
 * @param  {...string} dir The path to the directory to check
 * @returns A list of files with there absolute path
 */
let getFiles = (...dir) => {
    /**
     * @type {string[]}
     */
    let returner = []
    for (let i of fs.readdirSync(path.resolve(...dir), { encoding: "utf-8", withFileTypes: true })) {
        if (i.isFile()) {
            returner.push(path.resolve(...dir, i.name))
        } else if (i.isDirectory()) {
            returner.push(...getFiles(path.resolve(...dir, i.name)))
        } else {
            console.warn(`Found a non file or directory in ${path.resolve(...dir)}`)
        }
    }

    return returner
}

let listOfHtmlObjs = []
for (let i of fs.readdirSync(path.resolve("static_src"), { encoding: "utf-8", withFileTypes: true })) {
    let validEnding = i.name.endsWith(".html") || i.name.endsWith(".htm") || i.name.endsWith(".shtml") || i.name.endsWith(".shtm")
    if (i.isFile() && validEnding) {
        listOfHtmlObjs.push(new html({
            inject: "head",
            hash: true,
            scriptLoading: "defer",
            chunks: "all",
            template: path.resolve("static_src", i.name),
            favicon: path.resolve("static_src", "favicon.png"),
            filename: path.resolve("build", "static", i.name),
            minify: {
                caseSensitive: true,
                keepClosingSlash: true,
                // removeComments: true,
                minifyCSS: false,
                minifyJS: false
            },
        }))
    }
}
// console.log(getFiles("static_src", "js"))

class CopyAssetsPlugin {

    constructor(options = CopyAssetsPlugin.defaultOptions) {
        this.options = { ...CopyAssetsPlugin.defaultOptions, ...options}
    }

    /**
     * 
     * @param {webpack.Compiler} complier 
     */
    apply(complier) {
        // complier.hooks.afterCompile.tapAsync("Copy Assets", async (compilation, cb) => {
        //     complier.hooks.entryOption.tap("Copy Assets", (context, entry) => {
        //         console.log(context, entry)
        //         cb()
        //         return true
        //     })
        //     // console.log("Moving ")
        // })
        if (!fs.existsSync(this.options.from)) {
            throw new ReferenceError(`Error: no such file or directory ${this.options.from}. Did you set the 'from' option?`)
        }
        complier.hooks.emit.tapAsync("Copy Assets", (c, cb) => {
            fs.mkdirSync(path.resolve(this.options.to), {recursive: true})
            console.log(path.resolve(this.options.to))
            fs.cpSync(path.resolve(this.options.from), path.resolve(this.options.to), {
                recursive: this.options.recursive,
                dereference: true,
                errorOnExist: false,
                force: true,
                preserveTimestamps: true,
                filter: (src) => {
                    let notExclude = true
                    for (let i of this.options.excludeExt) {
                        if (src.endsWith(i)) {
                            notExclude = false
                        }
                    }
                    if (fs.statSync(src).isDirectory()) {
                        console.log(src)
                        let files = getFiles(src)
                        let length = files.length
                        for (let i of files) {
                            for (let y of this.options.excludeExt) {
                                if (i.endsWith(y)) {length--}
                            }
                        }
                        return length > 0
                    } else {
                        console.log(notExclude, src)
                        return notExclude
                    }
                }
            })
            cb()
        })
    }
    /**
     * @type {{excludeExt: string[], from: string, to: string, recursive: boolean}}
     */
    options
    static defaultOptions = {
        /**
         * File extensions to exclude
         * 
         * @default ["temp", "tmp", "bak"]
         */
        excludeExt: [ "temp", "tmp", "bak" ],
        /**
         * Path to copy from
         * 
         * @default "assets"
         */
        from: "assets",
        /**
         * Path to copy to
         * 
         * @default "dist/assets"
         */
        to: "dist/assets",
        /**
         * Whether to copy recursively
         * 
         * @default false
         */
        recursive: false
    }
}

let getEntries = () => {
    /**
     * @type {webpack.EntryObject}
     */
    let entries = {}
    entries["js/index"] = path.resolve("static_src", "js", "index.tsx")
    // for (let entry of getFiles(path.resolve("static_src", "js"))) {
    //     entries[ entry.replace(/[A-z0-9:\-\. \/\\]+js(\/|\\)/, 'js/').replace(/.tsx?/, '').replace('.js', '')] = entry
    // }
    for (let entry of getFiles(path.resolve("static_src", "assets")).filter(v => !v.includes("assets/src/") && !v.includes("assets\\src\\"))) {
        entries[ entry.replace(/[A-z0-9:\-\. \/\\]+assets(\/|\\)/, '') ] = entry
    }
    
    return entries
}

/**
 * @type {webpack.Configuration}
 */
let config = {
    entry: getEntries(),
    target: ["web", "es6"],
    stats: "normal",
    output: {
        path: path.resolve("build", "static"),
        charset: true,
        publicPath: "auto",
        clean: true,
        filename: (p, i) => {
            //@ts-ignore
            if (/\.(png|jpeg|jpg|jfif|gif|webp|ico|tif|tiff|bmp)$/i.test(p?.chunk?.name)) {
                return `${path.relative(".",os.tmpdir())}/[name]`
            }
            return `js/[name].js`
        },
        assetModuleFilename: `assets/[name][ext]`,
        cssFilename: `css/[name].css`
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(sc|c)ss$/i,
                use: [/* "style-loader" *//* css.loader, */
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                mode: "global",
                                namedExport: true
                            },
                            exportType: "css-style-sheet",
                            sourceMap: true
                        }
                    }, {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
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
                test: /\.svg$/i,
                dependency: { not: [ 'url' ] },
                type: 'asset/inline'
            }
        ]
    },
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        ...listOfHtmlObjs,
        // new css({
        //     experimentalUseImportModule: true,
        //     filename: `css/[name].css`
        // }),
        // new CopyAssetsPlugin({
        //     from: path.resolve("static_src", "assets"),
        //     to: path.resolve(process.env["MODE"] == "p" ? "dist" : "build", "static", "assets"),
        //     excludeExt: [".xcf"],
        //     recursive: true
        // }),
        // new copy({
        //     patterns: [
        //         {
        //             from: path.resolve("static_src", "assets"),
        //             to: path.resolve("build", "static", "assets"),
        //             globOptions: {

        //                 dot: false,
        //                 gitignore: true,
        //                 followSymbolicLinks: false,
        //                 ignore: ["**/*.xcf"],
        //                 stats: true
        //             }
        //         }
        //     ]
        // }),
        new webpack.ProgressPlugin({
            activeModules: true,
            dependencies: true,
            entries: true,
            modules: true,
            profile: true
            // handler: (a, b, ...c) => {console.log(a, b, ...c)}
        }),
/*         new webpack.DefinePlugin({
            public_path: publicPath
        }) */
    ],
    resolve: {
        plugins: [
        ],
        extensions: [ '.tsx', '.ts', '.js' ],
        symlinks: false
    },
    resolveLoader: {
        plugins: [
        ]
    },
    optimization: {
        minimize: false,
        minimizer: [
            new terser({
                parallel: true,
                extractComments: true,
                terserOptions: {
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
                    },
                    format: {
                        braces: true,
                        indent_level: 4,
                    }
                }
            })
        ],
        splitChunks: {
            chunks: "async",
        },
        concatenateModules: process.env[ "MODE" ] == 'p',
    }
}
module.exports = config

if (process.env["TEST_EXPORTS"]) {
    console.log(module.exports)
    console.log(listOfHtmlObjs)
    process.exit(0)
}
console.log("Building Web Assets")
