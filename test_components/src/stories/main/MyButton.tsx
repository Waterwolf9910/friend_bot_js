// type validHexChar = "a" | "b" | "c" | "d" | "e" | "f" | number
// type colorThreeHex = `#${validHexChar}${validHexChar}${validHexChar}`
import "./MyButton.css"
require("react")
// type colorThreeHex = `#${string | number}${string | number}${string | number}`
// type colorSixHex = `#${string}${string | number}${string | number}${string | number}${string | number}${string | number}`
// type cssColor = "inherit" |
//     "initial" |
//     "revert" |
//     "unset" |
//     `rgb(${number | `${number}%`}, ${number | `${number}%`}, ${number | `${number}%`})` |
//     `hsl(${number | `${number}%`}, ${number | `${number}%`}, ${number | `${number}%`})` |
//     `rgba(${number | `${number}%`}, ${number | `${number}%`}, ${number | `${number}%`}, ${number | `${number}%`})` |
//     `hsla(${number | `${number}%`}, ${number | `${number}%`}, ${number | `${number}%`}, ${number | `${number}%`})` |
//     colorThreeHex |
//     colorSixHex 
    
export interface ButtonOptions {
    /**
     * Is this button primary or not (will override {@link color} and {@link backgroundColor})
     */
    primary?: boolean
    /**
     * Sets the text color for the button
     */
    color?: import("csstype").Property.Color,
    /**
     * Sets the background color for the button
     */
    backgroundColor?: import("csstype").Property.BackgroundColor,
    /**
     * Sets the name for the button
     */
    name?: string,
    /**
     * Set a function to fire once button is pressed
     */
    onClick?: () => void,
    /**
     * The height of the button in pixels
     */
    height?: number,
    /**
     * The length of the button in pixels
     */
    length?: number
    disable?: boolean
}
export let Button = (options = defaultOptions) => {
    options = {...defaultOptions, ...options}
    if (options.primary) {
        return <button type="button" style={{ padding: `${options.height}px ${options.length}px`, marginLeft: "10px", marginRight: "10px" }} disabled = {options.disable} className="mybutton primary" title={options.name} onClick={options.onClick}>{options.name}</button>
    } else if (options.backgroundColor || options.color) {
        return <button type="button" className="mybutton" style={{ backgroundColor: options.backgroundColor, color: options.color, padding: `${options.height}px ${options.length}px`, marginLeft: "10px", marginRight: "10px" }} disabled={options.disable} title={options.name} onClick={options.onClick}>{options.name}</button>
    } else {
        return <button type="button" style={{ padding: `${options.height}px ${options.length}px`, marginLeft: "10px", marginRight: "10px" }} disabled={options.disable} className="mybutton secondary" title={options.name} onClick={options.onClick}>{options.name}</button>
    }
}
let defaultOptions: ButtonOptions = {
    backgroundColor: "bisque",
    color: "maroon",
    name: "Button",
    onClick: () => { console.log("B") },
    primary: false,
    height: 12,
    length: 20,
    disable: false
}

// export default Button
