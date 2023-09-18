import react = require("react")
import options = require("../options")
import HeaderBase = require("./header_base")
import Button = require("./button")
import utils = require("../utils")
import page_map = require("../page_list")
// require("../assets/*.png")

let urls: JSX.Element[] = []
for (let name in page_map) {
    let page_data = page_map[name]
    if (page_data.urls.includes(location.pathname)) {
        urls.push(<Button backgroundColor={"bisque"} color={"maroon"} name={page_data.title} key={page_data.title}/>)
    } else if (page_data.urls.length > 0) {
        urls.push(<a href={page_data.urls[ 0 ]} title={page_data.title} key={page_data.title}>
            <Button backgroundColor={"bisque"} color={"maroon"} name={page_data.title}/>
        </a>)
    }
}

let inv: NodeJS.Timer
let errSec = 0

export = (option: import("../options").MainHeaderOptions = options.defaultMainHeaderOptions) => {
    option = {...options.defaultMainHeaderOptions, ...option}

    let [ colors, setColors ] = react.useState({
        color: option.color,
        background: option.backgroundColor
    })
    let [ userInfo, setUserName ] = react.useState({
        id: "",
        name: "Guest",
        avatar: ""
    })

    react.useEffect(() => {
        let event = (msg: MessageEvent) => {
            let data: import("../../../dataTypes").client = JSON.parse(msg.data)
            console.log("Called")
            if (data.type != "user") {
                return;
            }
        }
        utils.WSConnection.addEventListener("message", event)

        return () => {
            utils.WSConnection.removeEventListener("message", event)
        }
    }, [])

    let theme = localStorage.getItem("theme")
    if (!theme) {
        theme = "dark"
        localStorage.setItem("theme", "dark")
    }
    let elem = <>
        <div>
            <a href="/friend_bot" title="placeholder">
                <p style={{color: colors.color, marginRight: "15px"}}>placeholder</p>
            </a>
            <img src={require(`/assets/themes/${theme}.png`)} title="Theme Image" style={{height: "10px", width: "10px"}}></img>
        </div>
        <div>
            {urls}
        </div>
        {option.element ? <div>
            {option.element}
        </div> : null}
        <div>
            <p>Hello {userInfo.name}</p>
            <Button height={10} length={10} name="Log In" id="login" />
        </div>
    </>
    // console.log(1, elem, userName, userError)
    return <HeaderBase element={elem} key="Main Header" backgroundColor={colors.background} color={colors.color} ></HeaderBase>
}
