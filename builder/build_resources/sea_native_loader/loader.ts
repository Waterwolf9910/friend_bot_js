import fs = require("fs")
import path = require("path")
import glob = require("glob")
let base = fs.readFileSync(path.resolve(__dirname, "base.js"), "utf8")
/**
 * Source is buffer
 * @type {import('webpack').LoaderDefinitionFunction}
 */
module.exports = function loader(this: ThisParameterType<import('webpack').LoaderDefinitionFunction<{temp_path: string}>>, source: string | Buffer) {
    // this.cacheable()
    let folder_name = this._module.rawRequest.replace(/^\.\.\//, './').replace(/build\/([Rr]elease|[Dd]ebug)\//, '').replace(/\.node/, '')
    let out = path.resolve(this.getOptions().temp_path, folder_name)
    fs.mkdirSync(out, { recursive: true })
    let resource_path = this.resource || this.resourcePath
    fs.writeFileSync(path.resolve(out, 'module.node'), source)
    // this.emitFile(`out-${path.basename(resource_path)}.data`, util.format(this))
    let libraries = {}
    // let _glob = glob.globSync((path.dirname(resource_path) + `/**/*.${process.platform == 'win32' ? 'dll' : '{so[!a-z],a[!a-z],so,a}'}`).replaceAll('\\', '/'), { absolute: true })
    let files = fs.readdirSync(path.dirname(resource_path).replace('\\', '')).filter(v => v.match(/\.(so|a)([0-9]+)?$/))//.map(v => path.resolve(resource_path, v))
    for (let file of files) {
        // let relative_path = path.relative(path.dirname(resource_path), file)
        let out_lib = path.resolve(out, file)
        fs.mkdirSync(path.dirname(out_lib), { recursive: true })
        fs.writeFileSync(out_lib, fs.readFileSync(path.resolve(path.dirname(resource_path), file)))
        // if (file == path.dirname(resource_path)) { continue }
        // libraries[] = fs.readFileSync(file).toJSON()
    }
    // if (Object.keys(libraries).length > 0) {
    //     fs.writeFileSync("out.json", JSON.stringify(libraries))
    //     process.exit(0)
    // }
    return base
        .replaceAll("{base_node_module_name}", path.join( folder_name, 'module.node'))
        // @ts-ignore
        // .replaceAll("{_is_dev_}", this.mode == 'development')
}

//@ts-ignore
module.exports.raw = true
