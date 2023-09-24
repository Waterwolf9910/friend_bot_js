import react = require("react")
import options = require("../options")
import utils = require("../utils")
// import bootstrap = require("bootstrap")
// require("../assets/*.png")

export = (option: import("../options").MainHeaderOptions = options.defaultMainHeaderOptions) => {
    option = {...options.defaultMainHeaderOptions, ...option}

    let [ userInfo, setUserInfo ] = react.useState<import("../../../websocket_proto").User['msg']>({
        id: "",
        selected_gid: '',
        name: "Guest",
        avatar: "",
        guilds: {}
    })

    let urls: JSX.Element[] = []

    for (let url in option.urls) {
        let page_data = option.urls[ url ]
        if (page_data.hidden) {
            continue
        }
        // console.log(__webpack_public_path__, page_data.urls.map(u => __webpack_public_path__.replace(/\/$/, '') + u), location.pathname)
        if (page_data.urls.map(u => __webpack_public_path__.replace(/\/$/, u)).includes(location.origin + location.pathname)) {
            urls.push(<a className="btn btn-outline-success btn-sm disabled" href={page_data.urls[ 0 ]} key={page_data.title}>{page_data.title}</a>)
        } else if (page_data.urls.length > 0) {
            urls.push(<a className="btn btn-outline-success btn-sm" onClick={(e) => {
                e.preventDefault()
                utils.change_page(url)
            }} key={page_data.title}>{page_data.title}</a>)
        }
    }

    react.useEffect(() => {
        let event = (msg: MessageEvent<import("../../../websocket_proto").client>) => {
            if (msg.data.type == "err" && msg.data.msg.err == "not_logged_in") {
                setUserInfo({
                    id: "",
                    selected_gid: "",
                    name: "Guest",
                    avatar: "",
                    guilds: {}
                })
                return;
            } else if (msg.data.type != "user") {
                return;
            }

            setUserInfo(msg.data.msg)
        }
        let onChangePage = () => {
            console.log("changed page")
            // refresh()
        }

        utils.WSConnection.addEventListener("message", event)
        utils.WSConnection.send({type: "request", msg: {type: "user"}})
        utils.addStatePushListener(onChangePage)

        return () => {
            utils.WSConnection.removeEventListener("message", event)
            utils.removeStatePushListener(onChangePage)
        }
    }, [])

    // let theme = localStorage.getItem("theme")
    // if (!theme) {
    //     theme = "dark"
    //     localStorage.setItem("theme", "dark")
    // }

    let guild_list: JSX.Element[] = []
    let i = 1;
    let _page = 0;
    let temp: JSX.Element = <></>
    for (let id in userInfo.guilds) {
        let guild = userInfo.guilds[id]
        let name = guild.name.slice(0, 22).padEnd(22)
        if (i % 2 == 0) {
            guild_list.push(<li key={guild.name}>
                <div className="no-flex">
                    <div>
                        {temp}
                        <button type="button" aria-current={guild.id == userInfo.id} style={guild.id == userInfo.selected_gid ? { pointerEvents: "none" } : undefined} onClick={() => {
                            utils.WSConnection.send({ type: 'set_gid', msg: { gid: guild.id } })
                            setUserInfo({ ...userInfo, selected_gid: guild.id })
                            // refresh()
                        }} className={`dropdown-item${guild.id == userInfo.selected_gid ? " active" : ''}`}><span className={`badge ${guild.hasBot ? "text-bg-success" : "text-bg-danger"}`}>Has Bot</span><pre>{name + (guild.name.length > 22 ? "..." : '')}</pre></button>
                    </div>
                </div>
            </li>)
            if (i % 10 == 0) {
                _page++
            }
            i++
            continue
        }
        temp = <button type="button" aria-current={guild.id == userInfo.id} style={guild.id == userInfo.selected_gid ? { pointerEvents: "none" } : undefined} onClick={() => {
            utils.WSConnection.send({ type: 'set_gid', msg: { gid: guild.id } })
            setUserInfo({ ...userInfo, selected_gid: guild.id })
            // refresh()
        }} className={`dropdown-item${guild.id == userInfo.selected_gid ? " active" : ''}`}><span className={`badge ${guild.hasBot ? "text-bg-success" : "text-bg-danger"}`}>Has Bot</span><pre>{name + (guild.name.length > 22 ? "..." : '')}</pre></button>
        i++;
    }

    return <header className="header">
        <div>
            {...urls}
        </div>
        {option.element ? <div>
            {option.element}
        </div> : null}
        <div className="dropdown-center">
            <p className="noddi dropdown-toggle" data-bs-toggle="dropdown" aria-expanded={false}>{userInfo.selected_gid ? userInfo.guilds[userInfo.selected_gid].name : "Select a Guild"}</p>
            <ul className="dropdown-menu" style={{maxHeight: 53 * 5 + 10, overflowY: "auto"}}>
                {...guild_list}
            </ul>
        </div>
        <div>
            {userInfo.avatar ? <picture>
                <source srcSet={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.webp`} />
                <img className="rounded" src={`https://cdn.discordapp.com/embed/avatars/${(BigInt(userInfo.id) >> 22n) % 6n}.png`} alt="Profile Picture"/>
            </picture> : <></>}
            <p>Hello {userInfo.name}</p>
            <button className="btn btn-outline-primary btn-sm" onClick={() => {
                if (!userInfo.id) {
                    console.log("Going to login flow...")
                    location.href = `${__webpack_public_path__}getLogin?redirect_url=${encodeURIComponent(location.href.replace(/^https?:\/\/.+(:[0-9]+)?\//, '/'))}`
                    return;
                }
                console.log("Logging out")
                location.href = `${__webpack_public_path__}logout`
            }}>{userInfo.id ? "Log out" : "Log In"}</button>
        
        </div>
    </header>
    // console.log(1, elem, userName, userError)
}
