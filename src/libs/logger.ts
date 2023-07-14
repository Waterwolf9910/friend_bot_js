import old_console = require("console")
import fs = require("fs")
import util = require("util")
import path = require("path")
class Logger extends old_console.Console {
    readonly debug = (message: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [log] `, filemsg, ...opt, '\n'))
        return super.debug(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [debug]`, message, ...optionalParams)
    }
    readonly log = (message?: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [log] `, filemsg, ...opt,  '\n'))
        return super.log(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [log]`, message, ...optionalParams)
    }
    readonly warn = (message?: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [warn] `, filemsg, ...opt, '\n'))
        return super.warn(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [warn]`, message, ...optionalParams)
    }
    readonly error = (message: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [error] `, filemsg, ...opt, '\n'))
        return super.error(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [error]`, message, ...optionalParams)
    }
    readonly writeError = (message: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [error] `, filemsg, ...opt, '\n'))
    }
    readonly writeLog = (message: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [log] `, filemsg, ...opt, '\n'))
    }
    readonly writeDebug = (message: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [log] `, filemsg, ...opt, '\n'))
    }
    /**
     * Prints to `stderr` with newline. Multiple arguments can be passed, with the
     * first used as the primary message and all additional used as substitution
     * values similar to [`printf(3)`](http://man7.org/linux/man-pages/man3/printf.3.html) (the arguments are all passed to `util.format()`).
     *
     * ```js
     * const code = 5;
     * console.fatal('error #%d', code);
     * // Prints: error #5, to stderr
     * console.fatal('error', code);
     * // Prints: error 5, to stderr
     * ```
     *
     * If formatting elements (e.g. `%d`) are not found in the first string then `util.inspect()` is called on each argument and the resulting string
     * values are concatenated. See `util.format()` for more information.
     * @since v0.1.100
     */
    readonly fatal = (message?: any, ...optionalParams: any[]) => {
        let time = this.getTime()
        let filemsg
        let opt
        if (typeof message == "undefined") {
            filemsg = ""
        } else {
            filemsg = message
        }
        if (typeof optionalParams == "undefined") {
            opt = ""
        } else {
            opt = optionalParams
        }
        fs.appendFileSync(path.resolve(this.logfile), util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [log] `, filemsg, ...opt, '\n'))
        super.error(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [fatal]`, message, ...opt)
        let error = new Error(util.format(`[${time.d}/${time.mo}/${time.y}-${time.h}:${time.mi}:${time.s}] [fatal]`, message, ...opt))
        Error.captureStackTrace(error, this.fatal)
        return error
    }
    private readonly getTime = () => {
        let date = new Date()
        let s: number | string = date.getSeconds()
        s = s < 10 ? `0${s}` : s
        let mi: number | string = date.getMinutes()
        mi = mi < 10 ? `0${mi}` : mi
        let h: number | string = date.getHours()
        h = h < 10 ? `0${h}` : h
        let d: number | string = date.getDate()
        d = d < 10 ? `0${d}` : d
        let mo: number | string = date.getMonth() + 1
        mo = mo < 10 ? `0${mo}` : mo
        let y = date.getFullYear()
        return { day: d, d: d, month: mo, mo: mo, year: y, y: y, hour: h, h: h, minute: mi, mi: mi, second: s, s: s }
    }
    // private readonly combineAndFilter = (array: string[]) => {
    //     let combine: string = ""
    //     for (let i of array) {
    //         if (i != undefined) {
    //             if (typeof i == "object") {
    //                 combine += JSON.stringify(i) + " "
    //             } else if (typeof i == "function" || typeof i == "undefined") {
    //                 continue;
    //             } else if (i) {
    //                 combine += i.toString() + " "
    //             }
    //         }
    //     }
    //     // combine = combine != undefined ? combine.replaceAll("undefined", "") : ""
    //     // console.log(combine)
    //     return combine
    // }
    constructor(logfile = "bot.log", stdout = process.stdout, stderr = process.stderr, ignoreErrors = true) {
        super({ stdout: stdout, stderr: stderr, ignoreErrors: ignoreErrors, groupIndentation: 4, })
        this.logfile = logfile
    }
    private logfile
    Console = old_console.Console
    Logger = Logger
}

// class ApplicationError extends Error {

// }

// export default Logger

module.exports = Logger

export = Logger
