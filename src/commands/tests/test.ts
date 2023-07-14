let _: { command?: () => {flag: 'r' | 's' | 'n', message: string | Promise<string>}, description: string } = {
    command: () => {
        console.log("'test'")
        return { flag: 'n', message: "this command does not return any data" }
    },
    description: "Sends 'test' to the bot console"
}

module.exports = _

export = _
