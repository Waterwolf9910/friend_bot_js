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
     * A child element for the element
     */
    element?: JSX.Element
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

export interface MainHeaderOptions extends BaseElementObject {
    /**
     * Uses the internal dark mode theme. (overwrites {@link lightMode}, {@link backgroundColor}, and {@link color})
     */
    darkMode?: boolean
    /** 
     * Uses the internal light mode theme (overwrites {@link backgroundColor} and {@link color})
     */
    lightMode?: boolean,
    urls?: typeof import("./page_list")
}

export let defaultMainHeaderOptions: MainHeaderOptions = {
    darkMode: true,
    urls: {}
}

export let defaultOptions: ButtonOptions = {
    name: "Button",
    id: undefined,
    primary: false,
    height: 12,
    length: 20,
    disable: false,
    hidden: false
}
