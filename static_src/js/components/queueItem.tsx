import react = require("react")
import utils = require("../utils")

type props = {
    data: import("../../../src/types").GuildQueue["id"]["queue"][0] & { pos: number, next: number },
    clickDelete?: react.MouseEventHandler, 
    clickSetNext?: react.MouseEventHandler, 
    clickSkipTo?: react.MouseEventHandler
}
export = ({ data, clickDelete, clickSetNext, clickSkipTo }: props) => {
    
    let ref = react.useRef<HTMLImageElement>(null)
    
    // Lazy load the images from youtube instead of loading them all at once
    react.useEffect(() => {
        let observer = new IntersectionObserver(e => {
            e.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }
                ref.current!.src = data.thumbnail
                observer.disconnect()
                //@ts-ignore
                observer = null;
            })
        })
        observer.observe(document.getElementById(`card_${data.pos}`)!)
        return () => {
            if (observer) {
                observer.disconnect()
            }
        }
        
    }, [])
    
    return <div className="card" style={{width: '90%'}}>
        <div className="row" style={{justifyContent: "space-between"}}>
            <div className="row center_items" style={{justifyContent: 'flex-start'}}>
                <img style={{width: 128, height: 72}} ref={ref} id={`card_${data.pos}`} title="video_img"/>
                <div className="col">
                    <div className="card-body">
                        <h5 className="card-title">{data.pos + 1}. <a href={data.link} className="link-info">{data.title}</a></h5>
                        <a href={data.uploader.url}><h6 className="card-subtitle link-info">{data.uploader.name}</h6></a>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="btn-group dropstart">
                    <button className="btn btn-outline-info dropdown-toggle noddi" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Options"><i className="bi bi-list"/></button>
                    <div className="dropdown-menu">
                        <div className="col center_items">
                            <button className="btn btn-sm btn-primary" onClick={clickSetNext} style={{width: "75%"}}>Set Next</button>
                            <button className="btn btn-sm btn-primary" onClick={clickSkipTo} style={{width: "75%"}}>Skip To</button>
                        </div>
                    </div>
                </div>
                <button className="btn btn-outline-danger" onClick={clickDelete} aria-label="Delete"><i className="bi bi-trash"/></button>
            </div>
        </div>
    </div>

}
