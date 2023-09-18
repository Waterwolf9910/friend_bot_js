import Header = require("../components/header")
let page = () => {
    return <div>
        <p>Hello World</p>
    </div>
}

let _: page = {
    page,
    title: "Home Page",
    urls: ["/"],
}

export = _
