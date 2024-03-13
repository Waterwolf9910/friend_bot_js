import * as testing from 'ink-testing-library'
import * as _ink from "ink"

let icon_map = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

//@ts-ignore
let ink: typeof import("ink/build") = _ink
let i = 0;
let node = <ink.Box>
    <ink.Box borderStyle='round' flexDirection='column' alignItems='center'>
        <ink.Box gap={3}>
            <ink.Box>
                <ink.Text>{icon_map[0]}</ink.Text>
            </ink.Box>
            <ink.Box>
                <ink.Text>{icon_map[1]}</ink.Text>
            </ink.Box>
            <ink.Box>
                <ink.Text>{icon_map[2]}</ink.Text>
            </ink.Box>
        </ink.Box>
        <ink.Box gap={1}>
            <ink.Box>
                <ink.Text>{icon_map[3]}</ink.Text>
            </ink.Box>
            <ink.Box>
                <ink.Text>{icon_map[4]}</ink.Text>
            </ink.Box>
            <ink.Box>
                <ink.Text>{icon_map[5]}</ink.Text>
            </ink.Box>
        </ink.Box>
        <ink.Box gap={1}>
            <ink.Box>
                <ink.Text>{icon_map[6]}</ink.Text>
            </ink.Box>
            <ink.Box>
                <ink.Text>{icon_map[7]}</ink.Text>
            </ink.Box>
            <ink.Box>
                <ink.Text>{icon_map[8]}</ink.Text>
            </ink.Box>
        </ink.Box>
        <ink.Text>Inner World</ink.Text>
    </ink.Box>
</ink.Box>

let render = testing.render(node as unknown as _ink.InkElement)

console.log(render.lastFrame())

// ink.render(node, process.stdout)
