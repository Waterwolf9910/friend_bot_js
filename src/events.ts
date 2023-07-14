import event = require("events")
import { EventList } from "./types"

interface Events extends event.EventEmitter {
    // menuListeners: ((interaction: import("discord.js").SelectMenuBuilder) => any)[] = []
    // on(event: "menu", listener: (interaction: import("discord.js").SelectMenuInteraction) => any): this
    // on(event: "auto", listener: () => any)
    // emit: (event: "menu", interaction: import('discord.js').SelectMenuInteraction)
    on(event: string | symbol, listener: (...args: any[]) => any): this
    on<Name extends keyof EventList>(event: Name, listener: EventList[Name]): this
    emit(event: string | symbol, ...args: any[]): boolean
    emit<Name extends keyof EventList>(event: Name, ...args: Parameters<EventList[Name]>): boolean

}
class Events extends event.EventEmitter {}

export = new Events()
