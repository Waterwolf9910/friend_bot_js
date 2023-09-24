import react = require("react")
import utils = require("../utils")

let page = () => {
    
    let [sec, setSec] = react.useState(7)
    
    if (sec <= 0) {
        // let ruri = new URLSearchParams(encodeURIComponent(location.search)).get("redirect_url") ?? "/"
        // if (!ruri.startsWith("/")) {
            //     ruri = "/"
            // }
        // utils.change_page(ruri)
        utils.change_page(__webpack_public_path__, undefined, true)
    }
        
    react.useEffect(() => {
        let inv = setInterval(() => {
            setSec(sec-1)
        }, 1000)

        return () => {
            clearInterval(inv)
        }
    })

    return <>
        <p>Login Successful</p>
        <sub>You will be redirected to the homepage in {sec} seconds</sub>
    </>
}

let _: page = {
    page,
    title: "Login",
    hidden: true,
    urls: ["/login"]
}
export = _
