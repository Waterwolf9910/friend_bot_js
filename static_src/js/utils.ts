//@ts-ignore
let bootstrap: typeof import("bootstrap") = undefined

// Lazy load bootstrap
require.ensure([], require => {
    bootstrap = require("bootstrap/dist/js/bootstrap.esm.min.js")
})

class Socket {
    /**
     * The WebSocket object to wrap around
     */
    #ws: WebSocket
    /**
     * Used to readd listeners on recreate
     */
    #listeners: { [ key: string ]: EventListenerOrEventListenerObject[] } = {}
    /**
     * A counter for the request id
     */
    #rid = 0
    #_realtoEdited: Map<EventListenerOrEventListenerObject, (data: Event) => any> = new Map
    
    constructor(server: `ws:/${`/${string}`}` | `wss:/${`/${string}`}`) {
        this.#ws = new WebSocket(server)
    }

    /**
     * 
     * @param message Data to send
     * @param reconnect reconnect is disconnected
     */
    send = (message: Omit<import("ws_proto").server, 'request_id'>, reconnect = true) => {
        let _message = message as import('ws_proto').server
        _message.request_id = this.#rid++
        
        if (this.#ws.readyState == WebSocket.OPEN) {
            this.#ws.send(JSON.stringify(_message))
            return this.#rid - 1
        }

        let onreconnect = () => {
            setTimeout(() => {
                this.#ws.send(JSON.stringify(_message))
                this.#ws.removeEventListener("open", onreconnect)
            }, 500)
        }
        
        if (this.#ws.readyState == WebSocket.CONNECTING) {
            this.#ws.addEventListener("open", onreconnect)
            return this.#rid-1
        }
        if (!reconnect) {
            console.warn("Disconnected from Server")
            return false
        } 
        this.#ws = new WebSocket(this.#ws.url)
        for (let type in this.#listeners) {
            for (let listener of this.#listeners[ type ]) {
                this.#ws.addEventListener(type, listener)
            }
        }
        this.#ws.addEventListener("open", onreconnect)
        return this.#rid - 1
    }

    close = (reason?: string, code = 0) => {
        if (this.#ws.readyState == WebSocket.CLOSED || this.#ws.readyState == WebSocket.CLOSING) {
            console.warn("Websocket is already closed")
        }
        this.#ws.close(code, reason)
    }

    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: (Omit<WebSocketEventMap, "message"> & {"message": MessageEvent<import("ws_proto").client>})[ K ]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        if (!this.#listeners[ type ]) {
            this.#listeners[ type ] = []
        }

        // Customize the return of the "message event"
        if (type == "message") {
            let fun = (_data: Event) => {
                let data = <MessageEvent>_data;
                if (typeof data.data != 'string') {
                    return;
                }
                try {

                    let value = new MessageEvent(data.type, {
                        bubbles: data.bubbles,
                        cancelable: data.cancelable,
                        composed: data.composed,
                        lastEventId: data.lastEventId,
                        origin: data.origin,
                        ports: [...data.ports],
                        source: data.source,
                        data: JSON.parse(data.data)
                    })
                    if (typeof listener == "function") {
                        return listener(value)
                    }
                    return listener.handleEvent(value)
                } catch (err) {
                    console.error(err)
                }
            }
            this.#_realtoEdited.set(listener, fun)
            this.#listeners[ type ].push(fun)
            return this.#ws.addEventListener(type, fun, options)
        }

        this.#listeners[ type ].push(listener)
        return this.#ws.addEventListener(type, listener, options)
    }

    removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
        if (!this.#listeners[type]) {
            this.#listeners[type] = []
        }

        // Remove the custom function
        if (type == "message") {
            this.#listeners[ type ] = this.#listeners[ type ].filter(v => v != this.#_realtoEdited.get(listener))
            this.#_realtoEdited.delete(listener)
            return this.#ws.removeEventListener(type, this.#_realtoEdited.get(listener)!)
        }

        this.#listeners[ type ] = this.#listeners[ type ].filter(v => v != listener)
        return this.#ws.removeEventListener(type, listener, options)
    }
}

/** */
let change_page = (url: string, data?: object, replace_history = false) => {
    let _url: string = url
    if (url.startsWith("./")) {
        _url = url.replace("./", location.pathname.replace(/\/$/, '') + '/')
    }
    if (replace_history) {
        window.history.replaceState(data, '', _url)
    } else {
        window.history.pushState(data, '', _url)
    }
    statePushedListeners.forEach(async v => v())
}

type stateListener = () => any
let statePushedListeners: stateListener[] = []

let storageKeys = {
    filterStorageKey: "header.filter.botonly",
    selectedGuildKey: "guild.selected.id",
    theme: "global.theme"
}

let error_msgs = {
    not_authed: "You are not logged in",
    no_admin_auth: "You do not have access to this page",
    no_gid: "You need to select a guild"
}

let renderError = (content: string, ref: import('react').RefObject<HTMLElement>) => {
    let popover = new bootstrap.Popover(ref.current!, {
        animation: true,
        delay: 500,
        placement: "bottom",
        title: "Error",
        content,
    })
    popover.show()
    let inv = setTimeout(() => {
        popover.dispose()
        clearInterval(inv)
    }, 2500)
}

export = {
    addStatePushListener: (listener: () => any) => { statePushedListeners.push(listener) },
    removeStatePushListener: (listener: () => any) => { statePushedListeners = statePushedListeners.filter(v => v != listener) },
    change_page,
    error_msgs,
    storageKeys,
    setTheme: (theme: string) => {
        localStorage.setItem(storageKeys.theme, theme)
        document.documentElement.setAttribute("data-bs-theme", theme)
    },
    loadTheme: () => {
        let theme = localStorage.getItem(storageKeys.theme) ?? "dark";
        document.documentElement.setAttribute("data-bs-theme", theme)
        return theme
    },
    renderError,
    get bootstrap() {
        return bootstrap
    },
    WSConnection: new Socket(`ws://${__webpack_public_path__.replace(location.protocol, '').replace(/\/\/$/, '/')}ws/data`)
}
