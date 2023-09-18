class Socket {

    #ws: WebSocket
    #listeners: { [ key: string ]: EventListenerOrEventListenerObject[] } = {}
    constructor(server: `ws:/${`/${string}`}` | `wss:/${`/${string}`}`) {
        this.#ws = new WebSocket(server)
    }

    /**
     * 
     * @param message Data to send
     * @param reconnect reconnect is disconnected
     */
    send = (message: string, reconnect = true) => {

        if (this.#ws.readyState == WebSocket.OPEN) {
            this.#ws.send(message)
        }

        let onreconnect = () => {
            this.#ws.send(message)
            this.#ws.removeEventListener("open", onreconnect)
        }
        if (!reconnect) {
            console.warn("Disconnected from Server")
            return false
        } else if (this.#ws.readyState == WebSocket.CLOSING || this.#ws.readyState == WebSocket.CLOSED) {
            this.#ws = new WebSocket(this.#ws.url)
            for (let type in this.#listeners) {
                for (let listener of this.#listeners[ type ]) {
                    this.#ws.addEventListener(type, listener)
                }
            }
            this.#ws.addEventListener("open", onreconnect)
            /* let inv = setInterval(() => {
                if (this.#ws.readyState == WebSocket.OPEN) {
                    clearInterval(inv)
                } else if (this.#ws.readyState == WebSocket.CLOSED || this.#ws.readyState == WebSocket.CLOSING) {
                    console.warn("The Socket closed while sending a message")
                    clearInterval(inv)
                }
            }, 200) */
        } else {
            this.#ws.addEventListener("open", onreconnect)
            /* let inv = setInterval(() => {
                if (this.#ws.readyState == WebSocket.OPEN) {
                    this.#ws.send(message)
                    clearInterval(inv)
                } else if (this.#ws.readyState == WebSocket.CLOSED || this.#ws.readyState == WebSocket.CLOSING) {
                    console.warn("Unable to reconnect")
                    clearInterval(inv)
                }
            }, 500) */
        }
    }

    close = (reason?: string, code = 0) => {
        if (this.#ws.readyState == WebSocket.CLOSED || this.#ws.readyState == WebSocket.CLOSING) {
            console.warn("Websocket is already closed")
            // ;(['']).sort(())
        }
        this.#ws.close(code, reason)
    }
    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        if (!this.#listeners[ type ]) {
            this.#listeners[ type ] = []
        }
        this.#listeners[ type ].push(listener)
        return this.#ws.addEventListener(type, listener, options)
    }
    removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[ K ]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
        this.#listeners[ type ] = this.#listeners[ type ].filter(v => v != listener)
        this.#ws.removeEventListener(type, listener, options)
    }
}
let change_page = (url: string, data?: object) => {
    let _url: string = url
    if (url.startsWith("./")) {
        _url = url.replace("./", location.pathname.replace(/\/$/, '') + '/')
    }
    window.history.pushState(data, '', _url)
    statePushedListeners.forEach(async v => v())
}

window.change_page = change_page

type stateListener = () => any
let statePushedListeners: stateListener[] = []

export = {
    addStatePushListener: (listener: () => any) => { statePushedListeners.push(listener) },
    removeStatePushListener: (listener: () => any) => { statePushedListeners = statePushedListeners.filter(v => v != listener) },
    change_page,
    WSConnection: module.hot ? new Socket("ws://localhost:3000/ws/data") : new Socket(`ws://localhost:${location.protocol == "https:" ? 433 : 80}/ws/data`)
}
