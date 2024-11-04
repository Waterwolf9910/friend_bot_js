import commands = require('../commands')

export = {
    name: 'interactionCreate',
    function: (c, cl, interaction) => {

        if (!interaction.isAutocomplete()) {
            return
        }

        let sub_name = interaction.options.getSubcommand(false)
        let cmd = commands.cmd_list[(sub_name ? sub_name + '.' : '') + interaction.commandName]
        if (!cmd) {
            return
        }
        // cmd.slas.
    }
} satisfies import('main/types').event<'interactionCreate'>
