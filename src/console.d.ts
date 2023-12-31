declare module 'logger' {
    global {
        interface Console {
            fatal: (message: any, ...optionalParams: any[]) => Error
            writeDebug: (message: any, ...optionalParams: any[]) => any
            writeError: (message: any, ...optionalParams: any[]) => any
            writeLog: (message: any, ...optionalParams: any[]) => any
        }
    }
    // export = globalThis.console
}
