import react from "react"
import utils from "../utils"

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

export default {
    page,
    title: "Logout",
    hidden: true,
    urls: ["/logout"]
} satisfies page
