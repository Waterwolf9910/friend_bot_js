import react = require("react")
import Header = require("./header")

let i = 7
let redirecting = false

setInterval(() => {
    i--
}, 1000)

let page = () => {
    let [sec, setSec] = react.useState(i)

    if (sec <= 0 && !redirecting) {location.href = "/"; redirecting = true}

    setInterval(() => {setSec(i)}, 1)

    return <>
        <Header />
        <p>Login Successful</p>
        <sub>You will be redirected to the homepage in {sec} seconds</sub>
    </>
}
module.exports = page
export = page
