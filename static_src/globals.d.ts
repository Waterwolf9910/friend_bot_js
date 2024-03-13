

declare global {
    interface Window {
        // state_data: {}
        change_page?: (url: string, data?: object) => void
        utils?: typeof import("./js/utils")
    }
    export type page = {
        title: string,
        page: () => JSX.Element,
        urls: string[],
        priority?: number
        hidden?: boolean
        styles?: {default: CSSStyleSheet}[],
    }
    
    export type WSServerData = import("ws_proto").server
    export type WSClientData = import("ws_proto").client
}


export {}
