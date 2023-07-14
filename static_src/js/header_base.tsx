require("../css/header.scss")

export = (options = option) => {
    options = {...option, ...options}
    // console.log(options)
    return <header className='header' style={{backgroundColor: options.backgroundColor, color: options.color}}>{options.element}</header>
}

let option: import("./options").HeaderOptions = {
    backgroundColor: "white",
    color: "bisque",
    element: <div><p>Hello World</p></div>
}
