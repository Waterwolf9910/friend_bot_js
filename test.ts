import node_canvas = require("canvas")
let icon_map = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
// let icon_map = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
let size = 256
let canvas = node_canvas.createCanvas(size, size)
let ctx = canvas.getContext('2d', {alpha: true})
let center_text_map = [1, 3, 5]
ctx.strokeStyle = 'rgba(128, 128, 128, 1)'
ctx.font = (size * 2 / 9) + 'px "Times New Roman"'
ctx.fillStyle = 'rgba(128, 128, 128, 1)'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
let border_size = size / 3
let i = 0
for (let y = 0; y < 3; ++y) {
    for (let x = 0; x < 3; ++x) {
        ctx.strokeRect(border_size * x, border_size * y, border_size, border_size)
        ctx.fillText(icon_map[i++], size / 6 * center_text_map[x], size / 6 * center_text_map[y] + 5)
    }
}
console.log(canvas.toDataURL("image/png"))
