export interface HeaderOptions extends BaseElementObject {
    element?: JSX.Element
}

export interface ButtonOptions extends BaseElementObject{
    /**
     * Is this button primary or not (will override {@link color} and {@link backgroundColor})
     */
    primary?: boolean
    /**
     * Sets the name for the button
     */
    name?: string
    /**
     * Disable the button
     */
    disable?: boolean
}
export interface BaseElementObject {
    /**
     * Background color of an element
     */
    backgroundColor?: import('csstype').Property.BackgroundColor
    /**
     * Text color of an element
     */
    color?: import('csstype').Property.Color
    /**
     * The height of the element in pixels
     */
    height?: number
    /**
     * The length of the element in pixels
     */
    length?: number
    /**
     * Hides the element from view
     */
    hidden?: boolean
    /**
     * Set a id for the element
     */
    id?: string
}

export interface MainHeaderOptions extends HeaderOptions {
    /**
     * Uses the internal dark mode theme. (overwrites {@link lightMode}, {@link backgroundColor}, and {@link color})
     */
    darkMode?: boolean
    /** 
     * Uses the internal light mode theme (overwrites {@link backgroundColor} and {@link color})
     */
    lightMode?: boolean
}

export interface ThemeOptions {
    backgroundColor: import('csstype').Property.BackgroundColor
    color: import('csstype').Property.Color
}

export let defaultMainHeaderOptions: MainHeaderOptions = {
    darkMode: true,
}

export let darkMode: ThemeOptions = {
    backgroundColor: "#061ba3",
    color: "#00ffb3"
}

export let lightMode: ThemeOptions = {
    backgroundColor: "bisque",
    color: "maroon"
}

export let defaultOptions: ButtonOptions = {
    backgroundColor: "bisque",
    color: "maroon",
    name: "Button",
    id: undefined,
    primary: false,
    height: 12,
    length: 20,
    disable: false,
    hidden: false
}
