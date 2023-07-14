require("../css/base.scss")
import react = require("react")
import react_dom = require("react-dom")
import Index = require("./page_index")
import Login = require("./page_login")
import Logout = require("./page_logout")
import Config = require("./page_config")
import BConfig = require("./page_bot_config")
import sender = require("./sender")


if (document.getElementById("index_root")) {
    react_dom.render(
        <react.StrictMode>
            <Index />
        </react.StrictMode>,
        document.getElementById("index_root")
    )
} else if (document.getElementById("login_root")) {
    react_dom.render(
        <react.StrictMode>
            <Login />
        </react.StrictMode>,
        document.getElementById("login_root")
    )
} else if (document.getElementById("logout_root")) {
    react_dom.render(
        <react.StrictMode>
            <Logout />
        </react.StrictMode>,
        document.getElementById("logout_root")
    )
} else if (document.getElementById("config_root")) {
    react_dom.render(
        <react.StrictMode>
            <Config />
        </react.StrictMode>,
        document.getElementById("config_root")
    )
} else if (document.getElementById("bconfig_root")) {
    react_dom.render(
        <react.StrictMode>
            <BConfig />
        </react.StrictMode>,
        document.getElementById("bconfig_root")
    )
} else {
    react_dom.render(
        <react.StrictMode>
            <p>Error: Unable to Render Content</p>
        </react.StrictMode>,
        document.body
    )
}

require("./all")

//@ts-ignore
window.post = sender.post
//@ts-ignore
window.get = sender.get
