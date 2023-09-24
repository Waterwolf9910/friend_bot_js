// An array of the pages in the project
import _pages = require("./pages/page_data.json")

let baseUrl = new URL(__webpack_public_path__)
let page_map: { [ key: string ]: page } = {}
let pages: page[] = _pages.map(p => require(`./pages/${p}`))
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
        if (!page_data.page || !page_data.title || !page_data.urls || page_data.urls.length < 1) {
            continue;
        }

        for (let url of page_data.urls) {
            page_map[ baseUrl.pathname.replace(/\/$/, '') + url ] = page_data
        }

    } catch {/** */ }
}

export = page_map
