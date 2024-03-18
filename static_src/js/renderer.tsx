import react from "react"
import page_map from "./page_list";
import dom from "react-dom/client"
import utils from "./utils";
import Header from "./components/header"
import Footer from "./components/footer"
// Our error page
import err from "./pages/404";
import baseStyle from "../css/base.scss"

if (module.hot) {
    window.utils = utils
}

let root: dom.Root
// let header: JSX.Element = 

let UpdatePage = async () => {
    console.log(page_map)
    let page_data = page_map[ location.pathname ] || err
    let Element = page_data.page
    document.title = page_data.title
    if (page_data?.styles) {
        // Base should be applied to at least one of the stylesheets
        document.adoptedStyleSheets = [ ...page_data.styles ]
    } else {
        document.adoptedStyleSheets = [ baseStyle ]
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
