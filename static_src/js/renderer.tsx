import react = require("react")
import page_map = require("./page_list")
import dom = require("react-dom/client")
import utils = require("./utils");
import Header = require("./components/header")
import Footer = require("./components/footer")
// Our error page
import err = require("./pages/404")
import baseStyle = require("../css/base.scss")

if (module.hot) {
    window.utils = utils
}

let root: dom.Root
// let header: JSX.Element = 

let UpdatePage = async () => {
    let page_data = page_map[ location.pathname ] || err
    let Element = page_data.page
    document.title = page_data.title
    if (page_data?.styles) {
        // Base should be applied to at least one of the stylesheets
        document.adoptedStyleSheets = [ ...page_data.styles.map(v => v.default) ]
    } else {
        document.adoptedStyleSheets = [ baseStyle.default ]
    }

    root.render(<react.StrictMode>
        <Header key="header" urls={page_map} />
        <main id="content">
            <Element />
        </main>
        <Footer />
    </react.StrictMode>)
}

// Load the theme from localStorage and apply it
utils.loadTheme()

if (module.hot) {
    root = module.hot?.data?.root || dom.createRoot(document.getElementById("root")!)
    module.hot.addDisposeHandler((data) => {
        data.root = root
        utils.removeStatePushListener(UpdatePage)
        window.removeEventListener("popstate", UpdatePage)
    })
    UpdatePage()
    module.hot.accept()
} else {
    root = dom.createRoot(document.getElementById("root")!)
    UpdatePage()
}

window.addEventListener("popstate", UpdatePage)
utils.addStatePushListener(UpdatePage)
