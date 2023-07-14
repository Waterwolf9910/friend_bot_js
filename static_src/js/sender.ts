/**
 * 
 * @param json The data to send to the server
 * @param location The path or server url to send the data
 * @param timeout in number of seconds
 * @returns data sent back from the server
 */
async function post(json: object, location: string, timeout?: number) {
    let signal: AbortSignal | null = null
    let aborter: NodeJS.Timeout = setTimeout(() => null)
    if (timeout) {
        let ac = new AbortController()
        signal = ac.signal
        aborter = setTimeout(() => {
            console.error("Response Timeout")
            ac.abort()
        }, timeout * 1000)
    }
    let res = await fetch(location, {
        body: JSON.stringify(json),
        method: "POST",
        cache: "no-cache",
        mode: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }, 
        credentials: "same-origin",
        redirect: "error",
        signal: signal
    })
    clearTimeout(aborter)
    if (res.ok) {
        return await res.json()
    } else {
        console.error(res.status, res.statusText)
    }
}
/**
 * 
 * @param location The path or server url to send the data
 * @param timeout in number of seconds
 * @returns data sent back from the server
 */
async function get(location: string, timeout?: number) {
    let signal: AbortSignal | null = null
    let aborter: NodeJS.Timeout = setTimeout(() => null)
    if (timeout) {
        let ac = new AbortController()
        signal = ac.signal
        aborter = setTimeout(() => {
            console.error("Response Timeout")
            ac.abort()
        }, timeout * 1000)
    }
    let res = await fetch(location, {
        method: "GET",
        cache: "no-cache",
        mode: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "error",
        credentials: "same-origin",
        signal: signal
    })
    clearTimeout(aborter)
    if (res.ok) {
        return await res.json()
    } else {
        console.error(res.status, res.statusText)
    }
}

export = {
    get,
    post
}
