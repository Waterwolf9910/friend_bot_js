import QueueItem = require("../components/queue_item")
import react = require("react")
import utils = require("../utils")

let page = () => {
    let [queueInfo, _sqi] = react.useState<import("ws_proto").MusicQueue["msg"]>({ cur: 0, next: 1, loop: false, queue: []})
    let [queue, _set_queue] = react.useState<typeof queueInfo["queue"]>([...queueInfo.queue])
    let [edited, _sedit] = react.useState(false)
    let [next, _set_next] = react.useState(0)
    let [loop, _set_loop] = react.useState<boolean | 'song'>(false)
    let [skip, _set_skip] = react.useState(false)
    let [page, set_page] = react.useState(0)
    let [voice_stat, set_voice_stat] = react.useState<import("ws_proto").VoiceWithBot["msg"] | import("ws_proto").VoiceWOBot["msg"]>()
    let [access, set_access] = react.useState(true)
    let [search_results, _ssr] = react.useState<import('ws_proto').SearchResult["msg"]>()

    let set_queue = (val: typeof queue) => {
        if (!edited) {
            _sedit(true)
        }
        _set_queue(val)
    }

    let set_next = (val: typeof next) => {
        if (!edited) {
            _sedit(true)
        }
        _set_next(val)
    }

    let set_loop = (val: typeof loop) => {
        if (!edited) {
            _sedit(true)
        }
        _set_loop(val)
    }

    let set_skip = (val: typeof skip) => {
        if (!edited) {
            _sedit(true)
        }
        _set_skip(val)
    }

    let reset = () => {
        _set_queue([...queueInfo.queue])
        _set_next(queueInfo.next)
        _set_loop(queueInfo.loop)
        _set_skip(false)
        _sedit(false)
        nextRef.current!.value = `${queueInfo.next}`
        searchRef.current!.value = ''
        set_page(0)
    }

    react.useEffect(() => {
        
        let event = (event: MessageEvent<WSClientData>) => {
            switch (event.data.type) {
                case "err": {
                    if (event.data.msg.err == "not_logged_in") {
                        set_access(false)
                        set_voice_stat({bot_in_channel: false})
                    }
                    break;
                }
                case "mqueue": {
                    _sqi(event.data.msg)
                    _set_next(event.data.msg.next)
                    _set_queue(event.data.msg.queue)
                    break;
                }
                case "search": {
                    _ssr(event.data.msg)
                    break
                }
                case "voice": {
                    set_voice_stat(event.data.msg)
                    if (event.data.msg.bot_in_channel) {
                        utils.WSConnection.send({
                            type: "request",
                            msg: {
                                type: "mqueue",
                                guild_id: sessionStorage.getItem(utils.storageKeys.selectedGuildKey)!
                            }
                        })
                    }
                }
            }

        }
        
        let startCheck = () => {
            let inv = setInterval(() => {
                let guild_id = sessionStorage.getItem(utils.storageKeys.selectedGuildKey)!
                if (guild_id) {
                    clearInterval(inv)
                    utils.WSConnection.send({
                        type: "request",
                        msg: {
                            type: "voice",
                            guild_id
                        }
                    })
                }
            }, 250)
        }

        // let _id = sessionStorage.getItem(utils.storageKeys.selectedGuildKey)
        // if (_id) {
        //     utils.WSConnection.send({
        //         type: "request",
        //         msg: {
        //             type: "mqueue",
        //             guild_id: _id
        //         }
        //     })
        // }

        // window.addEventListener("storage", onStore)
        utils.WSConnection.addEventListener("message", event)
        utils.WSConnection.send({type: 'request', msg: {type: 'user'}})
        startCheck()
        return () => {
            // window.removeEventListener("storage", onStore)
            utils.WSConnection.removeEventListener("message", event)
        }
    }, [])

    let elements: JSX.Element[][] = []
    let _page = 0
    for (let _pos in queue) {
        if (!elements[_page]) {
            elements[_page] = []
        }
        let pos = parseInt(_pos)
        let item = queue[pos]
        elements[_page].push(<QueueItem key={pos} data={{
            ...item,
            pos,
            next: queueInfo.next,
        }}
        clickDelete={() => {
            delete queue[pos]
            set_queue(queue.filter(a => a != null))
        }}
        clickSetNext={() => {
            set_next(pos)
            set_skip(false)
        }}
        clickSkipTo={() => {
            set_next(pos)
            set_skip(true)
        }}/>)

        if (((pos + 1) % 10) == 0) {
            _page++
        }
    }

    let pagination_items: JSX.Element[] = []
    for (let _page in elements) {
        pagination_items.push(<li key={`p${_page}`} className={"page-item" + (parseInt(_page) == page ? " disabled" : "")} onClick={(e) => {
            e.preventDefault()
            set_page(parseInt(_page))
        }}>
            <p className="page-link">{parseInt(_page) + 1}</p>
        </li>)
    }

    let pagination = (() => {
        let items: typeof pagination_items = []
        
        if (pagination_items.length < 4) {
            let i = 0
            while (true) {
                items.push(pagination_items[i++])
                if (!pagination_items[i]) {
                    break;
                }
            }
        } else {
            items.push(pagination_items[0], pagination_items[1], <li className="page-item" key="psel">
                <div className="dropup-center">
                    <p className="page-link dropdown-toggle noddi" data-bs-toggle="dropdown" aria-expanded="false" role="button">...</p>
                    <ul className="dropdown-menu">
                        <li className="col center_items">
                            <input className="dropdown-item" type="number" min={1} max={pagination_items.length} defaultValue={page + 1} onKeyDown={e => {
                                let val: number = e.currentTarget.valueAsNumber - 1
                                if (val >= pagination_items.length) {
                                    val = pagination_items.length - 1
                                }
                                if (val <= -1) {
                                    val = 0
                                }
                                if (e.key == "Enter") {
                                    set_page(val)
                                }
                            }} placeholder="1" />
                        </li>
                    </ul>
                </div>
            </li>, pagination_items[pagination_items.length - 2], pagination_items[pagination_items.length - 1])
        }
        return <ul className="pagination">
        
            <li className={"page-item" + (page <= 0 ? " disabled" : '')} aria-label="Previous" onClick={() => {
                if (page > 0) {
                    set_page(page - 1)
                }
            }}>
                <p className="page-link">
                    <i className="bi bi-arrow-left" />
                </p>
            </li>
            {items}
            <li className={"page-item" + (page >= pagination_items.length - 1 ? " disabled" : '')} aria-label="Next" onClick={() => {
                if (page < pagination_items.length) {
                    set_page(page + 1)
                }
            }}>
                <p className="page-link">
                    <i className="bi bi-arrow-right" />
                </p>
            </li>
        </ul>
    })()
    
    let searchRef = react.useRef<HTMLInputElement>(null)
    let nextRef = react.useRef<HTMLInputElement>(null)
    
    let searched = false
    let search = async () => {
        if (searched) {
            return;
        }

        let query = searchRef.current!.value

        if (query.length < 3) {
            return utils.renderError("Content is too short", searchRef)
        }

        searched = true
        utils.WSConnection.send({type: "request", msg: {type: "search", query}})

    }

    let setNext = async () => {
        let pos = nextRef.current!.valueAsNumber - 1
        if (pos < 0 || pos > queue.length - 1) {
            return utils.renderError(`${pos} is not in the range of the items in the queue`, nextRef)
        }

        set_next(pos)
    }

    if (!access) {
        return <p style={{textAlign: "center"}}>{utils.error_msgs.not_authed}</p>
    }

    if (!sessionStorage.getItem(utils.storageKeys.selectedGuildKey)) {
        return <p style={{textAlign: "center"}}>{utils.error_msgs.no_gid}</p>
    }

    if (!voice_stat) {
        return <div className="center_items">
            <div className="spinner-border"></div>
        </div>
    }

    if (voice_stat?.bot_in_channel && !voice_stat.in_channel) {
        return <p style={{ textAlign: "center" }}>You are not in the same voice channel as the bot</p>
    }

    if (!voice_stat?.bot_in_channel) {
        return <p style={{ textAlign: "center" }}>I am in a not in a channel</p>
    }

    let smodal_element: JSX.Element = <p></p>

    if (search_results) {
        (async () => {
            let modal = new utils.bootstrap.Modal(document.getElementById("searchModal")!, { keyboard: false, backdrop: "static" })
            modal.show()
        })()
        smodal_element = <>
            <h5>Videos</h5>
            {search_results.video_result.map(video => <div key={video.id} className="card">
                <div className="row" style={{justifyContent: "space-between"}}>
                    <img src={video.thumbnail} title="search_img" style={{width: '128px', height: '72px'}} />
                    <div className="col">
                        <div className="card-body">
                            <h5 className="card-title"><a href={video.url} className="linkinfo">{video.name}</a></h5>
                            <a href={video.author?.url} className="card-subtitle link-info">{video.author?.name ?? "No Author Recieved"}</a>
                        </div>
                    </div>
                    <button className="btn btn-outline-success" data-bs-dismiss="modal" aria-label="Select" type="button" onClick={e => {
                        queue.push({
                            duration: video.duration,
                            link: video.url,
                            thumbnail: video.thumbnail,
                            title: video.name,
                            uploader: {
                                name: video.author?.name!,
                                url: video.author?.url!
                            }
                        })
                        set_queue(queue)
                        _ssr(undefined)
                        document.querySelector("div.modal-backdrop.show")!.remove()
                    }}><i className="bi bi-check-lg" /></button>
                </div>
            </div>)}
        </>
    }

    return <div className="col center_items">
        <div id="searchModal" className="modal fade" tabIndex={-1} aria-labelledby="searchModalLabel" aria-hidden>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title" id="searchModalLabel">Search Results</h1>
                        {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
                    </div>
                    <div className="modal-body">
                        {smodal_element}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" aria-label="Close" data-bs-dismiss="modal" onClick={() => {
                            _ssr(undefined)
                            document.querySelector("div.modal-backdrop.show")!.remove()
                        }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="col center_items">
            <div className="input-group">
                <div className="input-group-text" id="search">Search</div>
                <input type="text" ref={searchRef} className="form-control" placeholder="Input Video Search Here" aria-label="Video Search Bar" aria-describedby="search" onKeyDown={e => {
                    if (e.key == "Enter") {
                        search()
                    }
                }}/>
                <button className="btn btn-outline-success" type="button" onKeyDown={e => e.preventDefault()} onClick={search}>Submit</button>
            </div>
            <div className="row" style={{justifyContent: "space-evenly"}}>
                <button type="button" aria-label="loop" className="btn btn-info" style={{ alignSelf: "flex-end", height: "40px" }} onClick={() => {
                    set_loop(loop == "song" ? false : loop ? "song" : true)
                }}>
                    <i style={{opacity: !loop ? .5 : undefined}} className={`bi ${loop == 'song' ? 'bi-repeat-1' : "bi-repeat"}`}/>
                </button>
                <div className="input-group" style={{maxWidth: "75%"}}>
                    <div id="next"className="input-group-text">Set Next</div>
                    <input type="number" placeholder="1" className="form-control" defaultValue={next + 1} aria-describedby="next" ref={nextRef} min={1} max={queue.length} onKeyDown={e => {
                        if (e.key == "Enter") {
                            setNext()
                        }
                    }} />
                    <button className="btn btn-outline-primary" type="button" onClick={setNext}>Submit</button>
                </div>
            </div>
        </div>
        {edited ? <div className="row" style={{justifyContent: "space-between", position: "fixed", bottom: "25px", zIndex: 1}}>
            <p className="info" style={{marginRight: "50px"}}>Changes have been made.</p>
            <div>
                <button type="button" className="btn btn-outline-success" style={{marginRight: "5px"}} onClick={() => {
                    utils.WSConnection.send({
                        type: "smqueue",
                        msg: {
                            loop,
                            next,
                            queue,
                            skipping: skip,
                            guild_id: sessionStorage.getItem(utils.storageKeys.selectedGuildKey)!
                        }
                    })
                    _sedit(false)
                }}>Send</button>
                <button type="button" className="btn btn-outline-danger" onClick={reset}>Cancel</button>
            </div>
        </div> : undefined}
        {/* <QueueItem data={{ duration: "", link: "https://music.youtube.com/watch?v=aM5Exmbfr60", source: "", thumbnail: "https://i.ytimg.com/vi/aM5Exmbfr60/hqdefault.jpg?sqp=-oaymwE1CKgBEF5IVfKriqkDKAgBFQAAiEIYAXABwAEG8AEB-AH-DoACuAiKAgwIABABGH8gMChxMA8=&rs=AOn4CLBPqTlov2rP-3QnR2_dax4p_RqJvA", title: "[U.U.F.O.] Tr.24 Myths You Forgot (feat. Toby Fox)", uploader: { name: "Camellia Official", url: "https://www.youtube.com/channel/UCV4ggxLd_Vz-I-ePGSKfFog" }, pos: 0 }}/> */}
        {elements.length > 0 ? elements[page] : <p>No Items in the Queue</p>}
        {elements.length > 0 ? pagination : undefined}
    </div>
}

let _: page = {
    page,
    title: "Music Queue",
    urls: ["/queue"],
    styles: [require("../../css/queue.scss")]
}

export = _
