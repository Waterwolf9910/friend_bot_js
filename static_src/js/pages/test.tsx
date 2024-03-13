import react = require('react')

type props = {
    board: string[]
}
let page = ({ board }: props = {board: []}) => {
    let square = 256
    board ??= ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
    console.log(board)
    let canvas = react.useRef<HTMLCanvasElement>(null)
    react.useEffect(() => {
        let center_text_map = [1, 3, 5]
        let ctx = canvas.current!.getContext('2d', {alpha: true})!
        ctx.strokeStyle = 'rgba(128, 128, 128, 1)'
        ctx.font = (square * 2 / 9) + 'px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        let border_size = square / 3
        let i = 0
        for (let y = 0; y < 3; ++y) {
            for (let x = 0; x < 3; ++x) {
                ctx.strokeRect(border_size * x, border_size * y, border_size, border_size)
                ctx.fillText(board[i++], square / 6 * center_text_map[x], square / 6 * center_text_map[y] + 5)
            }
        }

        return () => {
            ctx.clearRect(0, 0, square, square)
        }
    })
    return <div className="col center_items">
        <canvas id="canvas" width={square} height={square} ref={canvas} />
    </div>
}

let _: page = {
    page,
    title: "test",
    urls: ["/test"]
}

export = _
