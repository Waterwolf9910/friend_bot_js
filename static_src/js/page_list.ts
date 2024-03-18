let baseUrl = new URL(__webpack_public_path__)
let page_map: { [ key: string ]: page } = {}
// Get a list of the pages in the project
let pages = <page[]> await (async () => {
    let page_list: _page[] = []
    for (let key of require.context("./pages/", true, module.hot ? /\.tsx$/ : /(?<!test)\.tsx$/, 'sync').keys()) {
        page_list.push((await import(
            /* webpackPreload: true */
            `./pages/${key.replace(/^\.\//, '')}`
        )).default)
    }

    page_list = page_list.filter(v => {
        return v.page && v.title && v.urls && v.urls.length > 0
    })
    .sort((a, b) => {
        if (a.urls[0] == "/") {
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

    return page_list
})();
// .map(p => require(`./pages/${p.replace(/^\.\//, '')}`).default).filter(v => {
//     return v.page && v.title && v.urls && v.urls.length > 0
// })
// pages = pages.sort((a, b) => {

//     if (a.urls[ 0 ] == "/") {
//         return -1
//     }

//     if (a.title < b.title) {
//         return -1
//     }

//     if (a.title > b.title) {
//         return 1
//     }
    
//     return 0
// }).sort((a, b) => (a.priority || 1000) - (b.priority || 1000))

for (let page_data of pages) {
    try {
        for (let url of page_data.urls) {
            page_map[ baseUrl.pathname.replace(/\/$/, '') + url ] = page_data
        }

    } catch {/** */ }
}

export default {...page_map}
