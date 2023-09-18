require("../css/button.scss")
import option = require("./options")

export = (options = option.defaultOptions) => {
    options = { ...option.defaultOptions, ...options }
    if (options.primary) {
        return <button type="button" id={options.id} style={{ padding: `${options.height}px ${options.length}px`, marginLeft: "10px", marginRight: "10px" }} disabled={options.disable} className="mybutton primary" title={options.name} hidden={options.hidden}>{options.name}</button>
    } else if (options.backgroundColor || options.color) {
        return <button type="button" id={options.id} className="mybutton" style={{ backgroundColor: options.backgroundColor, color: options.color, padding: `${options.height}px ${options.length}px`, marginLeft: "10px", marginRight: "10px" }} disabled={options.disable} title={options.name} hidden={options.hidden}>{options.name}</button>
    } else {
        return <button type="button" id={options.id} style={{ padding: `${options.height}px ${options.length}px`, marginLeft: "10px", marginRight: "10px" }} disabled={options.disable} className="mybutton secondary" title={options.name} hidden={options.hidden}>{options.name}</button>
    }
}

