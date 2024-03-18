import react from "react"
import utils from "../utils"
// import bootstrap from "bootstrap"
// require("../assets/*.png")

export default (props: {urls?: typeof import("../page_list").default } = {}) => {
    
    let [ selected_gid, _sgid ] = react.useState<string>(sessionStorage.getItem(utils.storageKeys.selectedGuildKey) ?? '')
    let [useBotFilter, _setUseBotFilter] = react.useState<boolean>(localStorage.getItem(utils.storageKeys.filterStorageKey) != "false")
    let [theme, _set_theme] = react.useState<string>(localStorage.getItem(utils.storageKeys.theme) ?? "dark")

    let [ userInfo, setUserInfo ] = react.useState<import("ws_proto").User['msg']>({
        id: "",
        name: "Guest",
        avatar: "",
        guilds: {}
    })

    let [ appInfo, setAppInfo ] = react.useState<import("ws_proto").ApplicationInfo["msg"]>({
        client_id: ""
    })

    let setUseBotFilter = (value: boolean) => {
        localStorage.setItem(utils.storageKeys.filterStorageKey, `${value}`)
        _setUseBotFilter(value)
    }

    let setgid = (id: string) => {
        sessionStorage.setItem(utils.storageKeys.selectedGuildKey, id)
        return _sgid(id)
    }

    // Map our urls to navigatable elements
    let urls: JSX.Element[] = []
    for (let url in props.urls) {
        let page_data = props.urls[ url ]
        if (page_data.hidden) { // Don't add hidden pages
            continue
        }
        // console.log(__webpack_public_path__, page_data.urls.map(u => __webpack_public_path__.replace(/\/$/, '') + u), location.pathname)
        if (page_data.urls.length < 1) { // Don't add pages that don't have a url
            break;
        }
        let at = page_data.urls.map(u => __webpack_public_path__.replace(/\/$/, u)).includes(location.origin + location.pathname)
        urls.push(<div className="nav-item">
            <a data-bs-dismiss="offcanvas" className={`nav-link btn btn-outline-success btn-sm ${at ? "active" : ''}`} aria-current={at ? "page" : undefined} onClick={(e) => {
                e.preventDefault()
                if (at) {
                    return;
                }
                utils.change_page(url)
            }} key={page_data.title}>{page_data.title}</a>
        </div>)
    }

    let set_theme = () => {
        let theme = localStorage.getItem(utils.storageKeys.theme) == "dark" ? "light" : "dark"
        utils.setTheme(theme)
        _set_theme(theme)
    }

    // Setup communications via websockets
    react.useEffect(() => {
        let event = (msg: MessageEvent<WSClientData>) => {
            switch (msg.data.type) {
                case "err": {
                    if (msg.data.msg.err == "not_logged_in") {
                       setUserInfo({
                           id: "",
                           name: "Guest",
                           avatar: "",
                           guilds: {}
                       })
                    }
                    break;
                }

                case "user": {
                    setUserInfo(msg.data.msg)
                    break;
                }

                case "app_info": {
                    setAppInfo(msg.data.msg)
                }
            }

        }

        let sEvent = (e: StorageEvent) => {
            if (e.key == utils.storageKeys.theme && e.newValue) {
                document.documentElement.setAttribute("data-bs-theme", e.newValue)
                _set_theme(e.newValue)
            }
        }

        utils.WSConnection.addEventListener("message", event)
        utils.WSConnection.send({ type: "request", msg: { type: "user" } })
        utils.WSConnection.send({type: "request", msg: {type: "app_info"}})
        window.addEventListener("storage", sEvent)

        return () => {
            window.removeEventListener("storage", sEvent)
            utils.WSConnection.removeEventListener("message", event)
        }
    }, [])

    // let theme = localStorage.getItem("theme")
    // if (!theme) {
    //     theme = "dark"
    //     localStorage.setItem("theme", "dark")
    // }

    /**
     * Gets a renderable list of guilds from a UserGuild array
     * @param guilds array of UserGuilds
     * @returns a array of JSX Elements
     */
    let getGList = (guilds: import("main/types").UserGuild[] | {[key: string]: import("main/types").UserGuild}) => {
        let i = 0;
        let temp: JSX.Element = <></>
        let guild_list: JSX.Element[] = []
        for (let id in guilds) {
            //@ts-ignore
            let guild: import("main/types").UserGuild = guilds[id]
            // Set to a temp variable because we list the guilds side by side
            let _temp = <button type="button" aria-current={guild.id == userInfo.id} style={guild.id == selected_gid ? { pointerEvents: "none" } : undefined} onClick={(e) => {
                e.preventDefault()
                if (!guild.hasBot) {
                    open(`https://discord.com/oauth2/authorize?${new URLSearchParams({
                        client_id: appInfo.client_id,
                        scope: "bot applications.commands",
                        permissions: "63771672833910",
                        guild_id: guild.id,
                        disable_guild_select: "true"
                    }).toString()}`, "_blank", "noopener")
                    return;
                }
                setgid(guild.id)
                // refresh()
            }} className={`dropdown-item${guild.id == selected_gid ? " active" : ''}`}><span className={`badge ${guild.hasBot ? "text-bg-success" : "text-bg-danger"}`}>Has Bot</span><pre className="text-truncate">{guild.name}</pre></button>
            i++
            // Write both elements to array
            if (i % 2 == 0) {
                guild_list.push(<div className="row" key={guild.name}>
                    {temp}
                    {_temp}
                </div>)
                continue
            }
            temp = _temp;
        }
        return guild_list
    }
    
    let hasBotOnly: JSX.Element[] = getGList(Object.values(userInfo.guilds).filter(v => v.hasBot))
    let guild_list: JSX.Element[] = getGList(userInfo.guilds)

    return <header className="header row">
        <nav className="navbar">
            <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#navFlyIn" aria-controls="navFlyIn" aria-label="Toggle navigation">
                <i className="bi bi-list" />
            </button>
            <p>Friend Bot</p>
            <div className="offcanvas offcanvas-start" tabIndex={-1} id="navFlyIn" aria-labelledby="navLabel" aria-hidden>
                <div className="offcanvas-header">
                    <div className="row" style={{alignItems: 'baseline'}}>
                        <h5 className="offcanvas-title" id="navLabel">Friend Bot</h5>
                        <i style={{ paddingLeft: "20px", cursor: "pointer" }} className={"bi" + (theme != "dark" ? " bi-brightness-high-fill" : " bi-moon-stars")} onClick={set_theme}/>
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className="navbar-nav">
                        {...urls}
                    </div>
                </div>
            </div>
        </nav>
        <div className="dropdown-center col center_items" tabIndex={-1}>
            <p role="button" tabIndex={0} className="noddi dropdown-toggle" data-bs-toggle="dropdown" aria-expanded={false}>{selected_gid && userInfo.guilds[selected_gid] ? userInfo.guilds[selected_gid].name : "Select a Guild"}</p>
            <div className="dropdown-menu" style={{maxHeight: 53 * 5 + 35, overflowY: "scroll"}} aria-hidden>
                <div className="form-check form-switch row center_items">
                    <input id="toggleBFilter" className="form-check-input" type="checkbox" checked={useBotFilter} role="switch" style={{marginRight: '10px'}} onChange={() => setUseBotFilter(!useBotFilter)}/>
                    <label htmlFor="toggleBFilter" className="form-check-label">Filter Servers That Has Bot</label>
                    <p><i className="bi bi-arrow-clockwise" style={{cursor: "pointer"}} onClick={() => utils.WSConnection.send({type: "guild_refresh"})}/></p>
                </div>
                {guild_list.length > 0 ? (useBotFilter ? hasBotOnly : guild_list) : <div className="col center-items">
                    <p>No Guilds Available</p>
                </div>}
            </div>
        </div>
        <div className="row center_items">
            {userInfo.avatar ? <picture>
                <source srcSet={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.webp`} />
                <img className="rounded" src={`https://cdn.discordapp.com/embed/avatars/${(BigInt(userInfo.id) >> 22n) % 6n}.png`} alt="Profile" />
            </picture> : <></>}
            <p>Hello {userInfo.name}</p>
            <button className="btn btn-outline-primary btn-sm" onClick={async () => {
                if (!userInfo.id) {
                    console.log("Going to login flow...")
                    // location.href = `${__webpack_public_path__}getLogin?redirect_url=${encodeURIComponent(location.href.replace(/^https?:\/\/.+(:[0-9]+)?\//, '/'))}`
                    let url = await (await fetch(`${__webpack_public_path__}getLogin`)).text()
                    localStorage.setItem("redirect_uri", location.href)
                    location.href = url
                    return;
                }
                console.log("Logging out")
                location.href = `${__webpack_public_path__}logout`
            }}>{userInfo.id ? "Log out" : "Log In"}</button>
        
        </div>
    </header>
    // console.log(1, elem, userName, userError)
}
