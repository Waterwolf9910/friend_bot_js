import utils = require("../utils")
import react = require("react")

export = () => {
    
    react.useEffect(() => {
        document.body.style.marginBottom = "20px"
    })

    return <footer className="col fixed-bottom center_items" style={{background: "var(--bs-body-bg)"}}>
        <a onClick={() => {
            utils.change_page(`${__webpack_public_path__}licenses`)
        }}><sub>View Licenses Here</sub></a>
    </footer>
}
