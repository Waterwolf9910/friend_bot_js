import react = require("react")
import page_map = require("./page_list")
import dom = require("react-dom/client")
import utils = require("./utils");
import Header = require("./components/header")
// Our error page
import err = require("./pages/404")
import baseStyle = require("../css/base.scss")
// Lazy load bootstrap
require.ensure(["@popperjs/core"], require => {
    require("bootstrap/dist/js/bootstrap.esm.min.js")
})
if (process.env.NODE_ENV) {
    console.log(__webpack_public_path__)
}
// require.ensure([], require => {
//     baseStyle = require("../css/base.scss")
//     UpdatePage()
// })
// let baseStyle: typeof import('../css/base.scss') = { default: new CSSStyleSheet }

if (module.hot) {
    window.utils = utils
}

//TODO: Setup Actual Themes Later
let theme = localStorage.getItem("theme") ?? "dark"
let root: dom.Root
let Element: () => JSX.Element
// let header: JSX.Element = 

let UpdatePage = () => {
    let page_data = page_map[ location.pathname ] || err
    Element = page_data.page
    document.title = page_data.title
    if (page_data?.styles) {
        // Base should be applied to at least one of the stylesheets
        document.adoptedStyleSheets = [ ...page_data.styles.map(v => v.default) ]
    } else {
        document.adoptedStyleSheets = [ baseStyle.default ]
    }

    document.documentElement.setAttribute("data-bs-theme", theme)
    root.render(<react.StrictMode>
        <Header key="header" urls={page_map} />
        <main id="content">
            <Element />
        </main>
    </react.StrictMode>)
}


if (module.hot) {
    root = module.hot?.data?.root || dom.createRoot(document.getElementById("root")!)
    document.title = module.hot?.data?.title || page_map[ location.pathname ]?.title || err.title
    Element = module.hot?.data?.jsx || page_map[ location.pathname ]?.page || err.page
    module.hot.addDisposeHandler((data) => {
        data.root = root
        data.title = document.title
        data.jsx = Element
        utils.removeStatePushListener(UpdatePage)
        window.removeEventListener("popstate", UpdatePage)
    })
    UpdatePage()
    module.hot.accept()
} else {
    root = dom.createRoot(document.getElementById("root")!)
    document.title = page_map[ location.pathname ]?.title || err.title
    Element = page_map[ location.pathname ]?.page || err.page
}

window.addEventListener("popstate", UpdatePage)
utils.addStatePushListener(UpdatePage)
