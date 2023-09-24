import react = require("react")
import utils = require("../utils")

let page = () => {

    react.useEffect(() => {
        let timeout = setTimeout(() => {
            utils.change_page(__webpack_public_path__, undefined, true)
        })

        return () => clearTimeout(timeout)
    })

    return <div>
        <p>Logging Out</p>
    </div>
}

let _: page = {
    page,
    title: "Logout",
    hidden: true,
    urls: ["/logout"]
}

export = _
