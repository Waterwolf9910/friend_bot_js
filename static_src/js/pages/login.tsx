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
        utils.change_page(localStorage.getItem('redirect_uri')!, undefined, true)
        localStorage.removeItem('redirect_uri')
    }
        
    react.useEffect(() => {
        if (sec < 1) {
            return () => {
                clearInterval(inv)
            }
        }
        let inv = setInterval(() => {
            setSec(sec-1)
        }, 1000)

        return () => {
            clearInterval(inv)
        }
    })

    return <>
        <h2>Login Successful</h2>
        <p>You will be redirected in {sec} seconds</p>
    </>
}

let _: page = {
    page,
    title: "Login",
    hidden: true,
    urls: ["/login"]
}
export = _
