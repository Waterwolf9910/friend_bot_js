require("./MyHeader.css")
let React: typeof import("react") = require("react")
export interface HeaderOptions {
    backgroundColor?: import('csstype').Property.BackgroundColor
    color?: import('csstype').Property.Color
    element?: JSX.Element
}

export let Header = (options = option) => {
    options = {...option, ...options}
    console.log(options)
    return <header className='header' style={{backgroundColor: options.backgroundColor, color: options.color}}>{options.element}</header>
}

let option: HeaderOptions = {
    backgroundColor: "white",
    color: "bisque",
    element: <div><p>Hello World</p></div>
}
