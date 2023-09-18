import Header = require("../components/header")

let page = () => {
    return <div>
        <p>Hello World</p>
    </div>
}

let _: page = {
    page,
    title: "Bot Config",
    urls: ["/bot_config"],
}

export = _
