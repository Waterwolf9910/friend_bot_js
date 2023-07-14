import react = require("react")
import options = require("./options")
import HeaderBase = require("./header_base")
import Button = require("./button")
import sender = require("./sender")
// require("../assets/*.png")

let listOfUrls: {name: string, url: string}[] = [
    {
        name: "Homepage",
        url: __webpack_public_path__
    },
    {
        name: "Guild Config",
        url: `${__webpack_public_path__}/config`
    },
    {
        name: "Bot Config",
        url: `${__webpack_public_path__}/bot_config`
    }
]

let urls: JSX.Element[] = []
for (let i of listOfUrls) {
    if (location.href == i.url) {
        urls.push(<Button backgroundColor={"bisque"} color={"maroon"} name={i.name} key={i.name}/>)
    } else {
        urls.push(<a href={i.url} title={i.name} key={i.name}>
            <Button backgroundColor={"bisque"} color={"maroon"} name={i.name}/>
        </a>)
    }
}

async function getThemeList() {
    return sender.get("/themes")
}

sender.post({}, "/themes/set")

let user: {name?: string, id?: string, error?: string} = {name: undefined, id: undefined, error: undefined}
let inv: NodeJS.Timer
let errSec = 0
let getUser = async () => {
    if (!user.name && !location.href.includes("/login")) {
        await sender.get("/user").then(res => {
            if (res.success) {
                user = res.data.user
                // clearInterval()
            } else {
                user.error = res.message
                setTimeout(() => {
                    getUser()
                }, 5000)
            }
        }).catch((err) => {
            if (err) {
                console.log(err)
                errSec = 30
                let errTimer = setInterval(() => {
                    user.error = `Unable to connect. Retrying in ${errSec}`
                    if  (errSec <= 0 ) {
                        clearInterval(errTimer)
                        user.error = "Retrying..."
                        getUser()
                        errSec = 1
                    }
                    errSec--
                }, 1000)
            }
        })
    }
}

let topColor: typeof options.darkMode.color
let topBgColor: typeof options.darkMode.backgroundColor
getUser()
export = (option: import("./options").MainHeaderOptions = options.defaultMainHeaderOptions) => {
    option = {...options.defaultMainHeaderOptions, ...option}
    let [ bgColor, setBgColor ] = react.useState(options.darkMode.backgroundColor)
    let [ color, setColor ] = react.useState(options.darkMode.color)
    // let [ _update, update ] = React.useState(0)
    // let _a = 0
    let [ userError, setUserError ] = react.useState("Hello Guest")
    let [ userName, setUserName ] = react.useState("")

    //@ts-ignore
    window.user = user
    //@ts-ignore
    window.userError = userError
    //@ts-ignore
    window.setUserError = setUserError

    // if (!inv) {
        inv = setInterval(() => {
            if (user.name) {
                setUserName(user.name)
                clearInterval(inv)
            } else if (user.error) {
                setUserError(user.error)
            }
            // console.log(_update)
            // _a = _a+1
            // console.log(_a)
            // update(_a)
        }, 1)
    // }

    if (!topBgColor) {
        if (option.darkMode) {
            topBgColor = options.darkMode.backgroundColor
            setBgColor(options.darkMode.backgroundColor)
        } else if (option.lightMode) {
            topBgColor = options.lightMode.backgroundColor
            setBgColor(options.lightMode.backgroundColor)
        } else {
            topBgColor = option.backgroundColor || options.darkMode.backgroundColor
            setBgColor(option.backgroundColor || options.darkMode.backgroundColor)
        }
    }
    if (!topColor) {
        if (option.darkMode) {
            topColor = options.darkMode.color
            setColor(options.darkMode.color)
        } else if (option.lightMode) {
            topColor = options.lightMode.color
            setColor(options.lightMode.color)
        } else {
            topColor = option.color || options.darkMode.color
            setColor(option.color || options.darkMode.color)
        }
    }
    let theme = localStorage.getItem("theme")
    if (!theme) {
        theme = "dark"
        localStorage.setItem("theme", "dark")
    }
    let elem = <>
        <div>
            <a href="/friend_bot" title="placeholder">
                <p style={{color: color, marginRight: "15px"}}>placeholder</p>
            </a>
            <img src={`${__webpack_public_path__}/assets/${theme}.png`} title="Theme Image" style={{height: "10px", width: "10px"}}></img>
        </div>
        <div>
            {urls}
        </div>
        {option.element ? <div>
            {option.element}
        </div> : null}
        <div>
            {location.href.includes("/login") ? "Loading..." : userName?.length > 5 ? <>
                <p>Hello {userName}!</p>
                <Button primary height={10} length={10} name="Logout" id="logout" />
            </> : <>
                <p>{userError}</p>
                <Button height={10} length={10} name="Log In" id="login" />
            </>
            }
        </div>
    </>
    // console.log(1, elem, userName, userError)
    return <HeaderBase element={elem} key="Main Header" backgroundColor={bgColor} color={color} ></HeaderBase>
}
