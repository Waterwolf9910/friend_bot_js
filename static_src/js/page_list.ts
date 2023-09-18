// An array of the pages in the project
import pages = require("./pages/page_data.json")

let page_map: { [ key: string ]: page } = {}

for (let _page of pages) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        let page_data: page = require(`./pages/${_page}`)
        if (!page_data.page || !page_data.title || !page_data.urls || page_data.urls.length < 1) {
            continue;
        }

        for (let url of page_data.urls) {
            page_map[ url ] = page_data
        }

    } catch {/** */ }
}

export = page_map
