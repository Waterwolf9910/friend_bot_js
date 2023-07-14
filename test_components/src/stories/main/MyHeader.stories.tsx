import { ComponentStory, ComponentMeta } from "@storybook/react"
import { HeaderOptions } from "./MyHeader"
let React = require("react")
let react_dom: typeof import("react-dom/server") = require("react-dom/server")
let Header: typeof import("./MyHeader").Header = require("./MyHeader").Header
let Button: typeof import("./MyButton") = require("./MyButton")
interface HeaderFullOptions extends HeaderOptions {
    onLogin?: () => void
    onLogout?: () => void
    onClickLogo?: () => void
    user?: {name: string}
    backgroundColor?: import("csstype").Property.BackgroundColor
    color?: import("csstype").Property.Color
    element?: JSX.Element
}

let args: HeaderFullOptions = {
    onClickLogo: () => {
        location.href = "https://waterwolfies.com"
    },
    onLogin: () => {
        console.log("Logged In")
    },
    onLogout: () => {
        console.log("Logged Out")
    },
    backgroundColor: "silver",
    color: "rgba(33, 181, 213, 1)"
}
let listOfPaths: {name: string, url: string}[] = []
listOfPaths.push({ name: "Homepage", url: "https://waterwolfies.com" }, {name: "About Us", url: "https://waterwolfies.com/about_us"}, {name: "Projects", url: "https://waterwolfies.com/installers"})
let StoryHeader = (options: HeaderFullOptions) => {
    console.log(options)
    let urls: JSX.Element[] = []
    for (let i of listOfPaths) {
        if (i.url != location.href) {
            urls.push(<a href={i.url} title={i.name} key={i.name}>
                <Button.Button name={i.name} key={i.name} />
            </a>)
        } else {
            urls.push(<Button.Button name={i.name} key={i.name} />)
        }
    }
    let body = <>
        <div>
            <a href="https://waterwolfies.com">
                <img src="https://waterwolfies.com/favicon.ico" alt="Logo" width={"25px"} height={"35px"} ></img>
            </a>
            <h1>Friend Bot</h1>
        </div>
        <div>
            {urls}
        </div>
        <div>
            {options.user ? (
                <>
                    <p>Hello {options.user.name || "User"}!</p>
                    <Button.Button primary height={10} length={14} name="Logout" onClick={options.onLogout} />
                </>
            ) : (
                <>
                    <p>Hello Guest</p>
                    <Button.Button height={10} length={14} onClick={options.onLogin} name="Log In" />
                </>
            )}
        </div>
    </>
    return <React.StrictMode>
        <Header {...{backgroundColor: options.backgroundColor, color: options.color, element: body}} />
    </React.StrictMode>
}

export default {
    title: "Main/Header",
    component: StoryHeader,
    args: args
} as ComponentMeta<typeof StoryHeader>

let base: ComponentStory<typeof StoryHeader> = (args) => <StoryHeader {...args} />

export let LoggedIn = base.bind({});
LoggedIn.args = {
    ...args,
    user: {
        name: "World!"
    }
}
export let LoggedOut = base.bind({});
LoggedOut.args = args
console.log("React Version:", React.version)
console.log(react_dom.renderToString(StoryHeader(args)))
