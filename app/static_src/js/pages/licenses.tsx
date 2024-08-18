import style from "../../css/licenses.scss"
import react from "react"
import licenses from "../../assets/licenses.json"

let getRenderableError = (text: string) => {
    return <pre>{process.env.NODE_ENV == "development" ? text : "There was an error loading this license. Please try again later."}</pre>
}

/**
 * @param link Link to the license text
 * @returns the license as a react component
 */
function licenseFromLink(link: string) {
    let ref = react.useRef<HTMLPreElement>(null)
    let read = false

    if (link == undefined) {
        return { onClick: undefined, elem: getRenderableError("No Link Provided") }
    }

    let onClick = async () => {
        if (read) { return }
        try {
            let data = await fetch(link, {
                method: "GET",
            })

            if (!data.ok) {
                ref.current!.innerText = `(${data.status}): ${data.statusText}`
            }

            let text = await data.text()
            
            read = true
            ref.current!.innerText = text
        } catch (err) {
            ref.current!.innerHTML = process.env.NODE_ENV == "development" ? `${err}` : "There was an error loading this license. Please try again later."
        }
    }

    return { onClick, elem: <pre ref={ref} /> }
}

/**
 * @param link Link to the package.json
 * @returns the license as a react component
 */
function pkgJsonLicense(link: string) {
    let ref = react.useRef<HTMLPreElement>(null) 
    let read = false

    if (link == undefined) {
        return { onClick: undefined, elem: getRenderableError("No Link Provided") }
    }

    let onClick = async () => {
        try {
            if (read) { return; }

            let packFetch = await fetch(link, {
                method: "GET",
            })

            if (!packFetch.ok) {
                ref.current!.innerText = `(${packFetch.status}): ${packFetch.statusText}`
            }

            let pack: { license: string } = await packFetch.json()

            let gh = await fetch(`https://api.github.com/licenses/${pack.license}`)
            
            if (!gh.ok) {
                ref.current!.innerText = process.env.NODE_ENV == "development" ? `[gh_api] (${packFetch.status}): ${packFetch.statusText}` : "There was an error loading this license. Please try again later."
            }

            let license: { body: string } = await gh.json()

            read = true
            ref.current!.innerText = license.body
        } catch (err) {
            ref.current!.innerText = process.env.NODE_ENV == "development" ? `${err}` : "There was an error loading this license. Please try again later."
        }
    }

    return { onClick, elem: <pre ref={ref} /> }
}

let getListItems = () => {
    let elements: JSX.Element[] = []
    for (let rawkey in licenses) {
        if (rawkey.startsWith('$')) {
            continue;
        }

        //@ts-ignore
        let obj: { type: "ui" | "server" | "both", link: string, repo: string } = licenses[rawkey]
        let license: ReturnType<typeof licenseFromLink>
        if (obj.link.endsWith(".json")) {
            license = pkgJsonLicense(obj.link)
        } else {
            license = licenseFromLink(obj.link);
        }
        let key = rawkey.toLowerCase().replace(/[^A-z0-9_-]/g, '')
        elements.push(<div className="list-group-item">
            <div className="col">
                <span className="badge text-bg-info">{obj.type == "ui" ? "UI" : obj.type == "server" ? "Bot/Server" : "Both"}</span>
                <button type="button" onClick={license.onClick} data-bs-toggle="modal" data-bs-target={`#${key}`}>{rawkey}</button>

                <div className="modal fade" tabIndex={-1} id={key} aria-labelledby={`${key}ModalLabel`} aria-hidden>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="col modal-header">
                                <div className="mh row">
                                    <h1 className="modal-title" id={`${key}ModalLabel`}>{rawkey} License</h1>
                                    <div style={{position: "relative", left: "70px", bottom: "25px"}}>
                                       <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                </div>
                                {obj.repo ? <a href={obj.repo}>Source</a> : undefined}
                            </div>
                            <div className="modal-body">
                                {license.elem}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
    }
    return elements
}
let page = () => {
    return <div className="col center_items" style={{marginBottom: '20px'}}>
        <p>Note: peer dependencies of other packages are not included in this list</p>
        <div className="list-group list-group-flush">
            {...getListItems()}
        </div>
    </div>
}

export default {
    page,
    title: "Licenses",
    urls: ["/licenses"],
    hidden: true,
    styles: [style]
} satisfies page
