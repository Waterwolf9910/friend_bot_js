import style from "../../css/error.scss"

let page = () => {
    return <div>
        <p>This Page Does Not Exist</p>
        <p>Click <a href="" onClick={(e) => {e.preventDefault(); e.stopPropagation(); history.back()}}>here</a> to go back</p>
    </div>
}

export default {
    page,
    title: "Not Found",
    urls: [],
    styles: [style]
}
