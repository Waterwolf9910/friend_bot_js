// let _: { command: (ctx: typeof import("discord.js").Message.prototype, ...args: string[]) => import("../../types").CommandResult | Promise<import("../../types").CommandResult>, description: string } = {
//     command: async (ctx, max) => {
//         let retuner = "React to the above text"
//         // console.log(max)
//         ;(await ctx.channel.send("Over Here")).awaitReactions({ time: 20000, maxEmojis: parseInt(max) || Infinity, filter: (_null, user) => user.id == ctx.author.id }).then(emoji_col => {
//             // console.log(emoji_col.first())
//             // console.log(emoji_col)
//             emoji_col.each((val, key) => { console.log(key/* , ": ", val.emoji.name */) })
//             // console.log(emoji_col.toJSON())
//             ctx.channel.send("Done!")
//         }).catch(e => {console.log(e)})
//         return { flag: 'r', message: retuner }
//     },
//     description: "sends reacted emojis to console"
// }

// module.exports = _

// export = _


// 
