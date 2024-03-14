let baseUrl = new URL(__webpack_public_path__)
let page_map: { [ key: string ]: page } = {}
// Get a list of the pages in the project
let pages: page[] = require.context("./pages/", true, module.hot ? /\.tsx$/ : /(?<!test)\.tsx$/, 'sync').keys().map(p => require(`./pages/${p.replace(/^\.\//, '')}`)).filter(v => {
    return v.page && v.title && v.urls && v.urls.length > 0
})
pages = pages.sort((a, b) => {

    if (a.urls[ 0 ] == "/") {
        return -1
    }

    if (a.title < b.title) {
        return -1
    }

    if (a.title > b.title) {
        return 1
    }
    
    return 0
}).sort((a, b) => (a.priority || 1000) - (b.priority || 1000))

for (let page_data of pages) {
    try {
        for (let url of page_data.urls) {
            page_map[ baseUrl.pathname.replace(/\/$/, '') + url ] = page_data
        }

    } catch {/** */ }
}

export = page_map
