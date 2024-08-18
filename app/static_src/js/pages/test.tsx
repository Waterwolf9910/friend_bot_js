import style from '../../css/test.scss'
import react from 'react'

let page = () => {
    // let square = 256
    // board ??= ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
    // console.log(board)
    // let canvas = react.useRef<HTMLCanvasElement>(null)
    // react.useEffect(() => {
    //     let center_text_map = [1, 3, 5]
    //     let ctx = canvas.current!.getContext('2d', {alpha: true})!
    //     ctx.strokeStyle = 'rgba(128, 128, 128, 1)'
    //     ctx.font = (square * 2 / 9) + 'px monospace'
    //     ctx.textAlign = 'center'
    //     ctx.textBaseline = 'middle'
    //     let border_size = square / 3
    //     let i = 0
    //     for (let y = 0; y < 3; ++y) {
    //         for (let x = 0; x < 3; ++x) {
    //             ctx.strokeRect(border_size * x, border_size * y, border_size, border_size)
    //             ctx.fillText(board[i++], square / 6 * center_text_map[x], square / 6 * center_text_map[y] + 5)
    //         }
    //     }

    //     return () => {
    //         ctx.clearRect(0, 0, square, square)
    //     }
    // })
    // return <div className="col center_items">
    //     <canvas id="canvas" width={square} height={square} ref={canvas} />
    // </div>

    let config_key = 'Hello'
    let modal_name = 'main.Hello'
    let config_path = config_key

    let default_values = {
        string: 'hello world',
        number: 42,
        boolean: true,
        array: [],
        object: {},
        null: null
    }
    let [add_type, set_add_type] = react.useState<keyof typeof default_values>('null')
    let [add_value, set_value] = react.useState<any>()

    if (add_value == null && add_type != 'null') {
        set_value(default_values[add_type])
    }

    return <div className='card'>
        <div className="card-header row" style={{justifyContent: 'space-between'}}>
            {config_key}
            <p data-bs-toggle="modal" data-bs-target={`#${modal_name}`} style={{ cursor: 'pointer', margin: 0, fontSize: '16px' }}>+</p>
        </div>
        <div className="modal fade" id={modal_name} data-bs-backdrop="static" tabIndex={-1} aria-hidden>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title">Add to {config_key}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body col center-items">
                        <div className='input-group form-check'>
                            <span className='input-group-text' id={`${config_path}_type_label`}>type</span>
                            <select className='form-select' defaultValue={"null"} aria-labelledby={`${config_path}_type_label`} onChange={(e) => {
                                set_add_type(e.target.value as 'string')
                                set_value(default_values[e.target.value as 'string'])
                            }}>
                                <option value={'null'} label='Select a type' />
                                <option value='string' label='string' />
                                <option value='number' label='number' />
                                <option value='boolean' label='boolean' />
                                <option value='array' label='array' />
                                <option value='object' label='object' />
                            </select>
                        </div>
                        <div className='input-group form-check'>
                            <span className='input-group-text' id={`${config_path}_value_label`}>value</span>
                            {add_type == 'string' ? <textarea
                                rows={2}
                                style={{flexGrow: 1}}
                                defaultValue={add_value}
                                onChange={(e) => set_value(e.target.value)}
                             /> : add_type == "boolean" ?
                            <button
                                type="button"
                                className={`form-control btn btn-${add_value ? "success" : "danger"}`}
                                aria-describedby={`${config_path}_value_label`}
                                defaultChecked={add_value}
                                title={add_value.toString()}
                                onClick={() => set_value(!add_value)}>
                                {add_value ? "Enabled" : "Disabled"}
                            </button> : <input 
                                type={add_type == 'number' ? 'number' : 'text'}
                                defaultValue={add_type == "number" ? add_value : ''}
                                disabled={add_type != 'number'}
                                style={{ flexGrow: 1 }}
                                onChange={(e) => set_value(e.target.value)}
                            />}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button"
                            className="btn btn-primary"
                            disabled={add_type == 'null'}
                            data-bs-dismiss="modal"
                            onClick={() => {
                                console.log(add_type, add_value)
                            }}
                        >Add</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default {
    page,
    title: "test",
    urls: ["/test"],
    styles: [style]
} satisfies page
