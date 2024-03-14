import style = require("../../css/config.scss")
import react = require('react')
import ConfigEntry = require('../components/config_entry')
import utils = require('../utils')

let cur_rid = -1
let page = () => {

    let [access, set_access] = react.useState(false)
    let [_bot_config, _set_bot_config] = react.useState<import("main/types").Config>()
    let [edited, set_edited] = react.useState(false)
    let [bot_config, _sbc] = react.useState<typeof _bot_config>({..._bot_config!})

    if (!_bot_config && bot_config) {
        _set_bot_config({...bot_config!})
    }

    let set_bot_config = (config: import('main/types').Config) => {
        set_access(true)
        _set_bot_config(config)
        _sbc({...config})
    }

    react.useEffect(() => {
        let event = (event: MessageEvent<WSClientData>) => {
            let data = event.data
            switch (data.type) {
                case 'err': {
                    if (data.request_id != cur_rid) {
                        return
                    }
                    if (data.msg.err == "not_logged_in" || data.msg.err == "incorrect_auth") {
                        set_access(false)
                    }
                    break
                }
                case 'bot_config': {
                    set_bot_config(data.msg)
                    break;
                }
                case 'success': {
                    if (data.msg.type == 'bot_config' && data.request_id == cur_rid) {
                        _set_bot_config(undefined)
                        set_edited(false)
                    }
                    break;
                }
                // case 'guild_config': {
                //     break;
                // }
            }
        }
        utils.WSConnection.addEventListener("message", event)
        cur_rid = utils.WSConnection.send({type: 'request', msg: { type: 'bot_config' }}) as number
        return () => utils.WSConnection.removeEventListener("message", event)
    }, [])

    if (!access) {
        return <p>{utils.error_msgs.no_admin_auth}</p>
    }

    let on_change = (path: string, value: import("main/types").Config['']) => {
        let bc = bot_config
        let split = path.split('.').map(_v => {
            let v = parseInt(_v.replace(/Item ([0-9]+)/, '$1'))
            return isNaN(v) ? _v : v
        })

        let holder: any = bc!
        for (let i = 0; i < split.length; ++i) {
            if (i == split.length - 1) {
                holder[split[i]] = value
                break
            }
            holder = holder[split[i]]
        }
        set_edited(true)
        _sbc({...bc!})
    }

    return <div className="col center_items">
        {edited ? <div className="row" style={{ justifyContent: "space-between", position: "fixed", top: "55px", zIndex: 1, background: 'var(--bs-body-bg)'}}>
            <p className="info" style={{ marginRight: "50px" }}>Changes have been made.</p>
            <div>
                <button type="button" className="btn btn-outline-success" style={{ marginRight: "5px" }} onClick={() => {
                    cur_rid = utils.WSConnection.send({ type: 'bot_config', msg: bot_config! }) as number
                }}>Send</button>
                <button type="button" className="btn btn-outline-danger" onClick={() => {_sbc({..._bot_config!}); set_edited(false)}}>Cancel</button>
            </div>
        </div> : undefined}
        <ConfigEntry config_key="bot_config.json" value={bot_config!} no_key_in_path on_change={on_change} />
        {/* {Object.keys(bot_config!).map(key => <ConfigEntry config_key={key} key={key} value={bot_config![key]} on_change={on_change}/>)} */}
    </div>
}

export = {
    page,
    title: "Bot Config",
    urls: ["/bot_config"],
    styles: [style]
} satisfies page
