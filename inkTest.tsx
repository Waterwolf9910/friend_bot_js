import stream = require('stream')
import ink = require("ink")
import renderer = require("ink-testing-library")
import react = require("react")
import util = require('util')
import events = require('events')
let myEvent = new events({})
let React = react
let game = {
    id: 'dev-id',
    t1: { player: 0, icon: "1️⃣" },
    t2: { player: 0, icon: "2️⃣" },
    t3: { player: 0, icon: "3️⃣" },
    t4: { player: 0, icon: "4️⃣" },
    t5: { player: 0, icon: "5️⃣" },
    t6: { player: 0, icon: "6️⃣" },
    t7: { player: 0, icon: "7️⃣" },
    t8: { player: 0, icon: "8️⃣" },
    t9: { player: 0, icon: "9️⃣" },
    turn: 1
}
let players = {
    p0: { icon: (tile: number) => {
        switch (tile) {
            case 0: {
                return "1️⃣"
            }
            case 1: {
                return "2️⃣"
            }
            case 2: {
                return "3️⃣"
            }
            case 3: {
                return "4️⃣"
            }
            case 4: {
                return "5️⃣"
            }
            case 5: {
                return "6️⃣"
            }
            case 6: {
                return "7️⃣"
            }
            case 7: {
                return "8️⃣"
            }
            case 8: {
                return "9️⃣"
            }
        }
    }, id: null},
    p1: { icon: () => "❌", id: 'dev-id' },
    p2: { icon: () => "⭕", id: 'dev-id' }
}
let baseBoard: [ 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2 ] = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
let Board = () => {
    let [board, _setBoard] = react.useState(baseBoard)
    let setBoard = (index: number, value: 0 | 1 | 2) => {
        let tempBoard = board
        tempBoard[index] = value;
        _setBoard(tempBoard)
    }

    for (let i = 0; i < board.length; i++) {
        let tileOwner = board[i]
        game[`t${i + 1}`].icon = players[`p${tileOwner}`].icon(i)
        game[`t${i+1}`].player = tileOwner
    }

    myEvent.on("change", (i, v) => {
        setBoard(i, v)
    })

    return <>
        <ink.Text>Hello World {util.format(board)}</ink.Text>
        <ink.Box height={50} width={50} display={"flex"} flexDirection={"column"}>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t1.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t2.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t3.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6}>
                <ink.Text>
                    {game.t4.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t5.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t6.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t7.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t8.icon}
                </ink.Text>
            </ink.Box>
            <ink.Box height={3} width={6} borderStyle='round'>
                <ink.Text>
                    {game.t9.icon}
                </ink.Text>
            </ink.Box>
        </ink.Box>
    </>
}

let instance = renderer.render(<Board />)
console.log(instance.lastFrame())
let lastIndex = 0
let lastVal = 0
setInterval(() => {
    if (lastIndex == 8) {
        lastIndex = 0
    }
    if (lastVal == 2) {
        lastVal = 0
    }
    myEvent.emit("change", lastIndex++, lastVal++)
}, 1000)
// setTimeout(() => console.log(mystream.read()), 2000)
