class Socket {
    /**
     * The WebSocket object to wrap around
     */
    #ws: WebSocket
    /**
     * Used to readd listeners on recreate
     */
    #listeners: { [ key: string ]: EventListenerOrEventListenerObject[] } = {}
    #_realtoEdited: Map<EventListenerOrEventListenerObject, (data: Event) => any> = new Map
    constructor(server: `ws:/${`/${string}`}` | `wss:/${`/${string}`}`) {
        this.#ws = new WebSocket(server)
    }

    /**
     * 
     * @param message Data to send
     * @param reconnect reconnect is disconnected
     */
    send = (message: import("../../websocket_proto").server, reconnect = true) => {

        if (this.#ws.readyState == WebSocket.OPEN) {
            this.#ws.send(JSON.stringify(message))
        }

        let onreconnect = () => {
            this.#ws.send(JSON.stringify(message))
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

    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: (Omit<WebSocketEventMap, "message"> & {"message": MessageEvent<import("../../websocket_proto").client>})[ K ]) => any, options?: boolean | AddEventListenerOptions): void;
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

window.change_page = change_page

type stateListener = () => any
let statePushedListeners: stateListener[] = []

export = {
    addStatePushListener: (listener: () => any) => { statePushedListeners.push(listener) },
    removeStatePushListener: (listener: () => any) => { statePushedListeners = statePushedListeners.filter(v => v != listener) },
    change_page,
    WSConnection: new Socket(`ws://${__webpack_public_path__.replace(location.protocol, '').replace(/\/\/$/, '/')}ws/data`)
}
