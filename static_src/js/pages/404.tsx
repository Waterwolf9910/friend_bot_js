let page = () => {

    return <div>
        <p>This Page Does Not Exist</p>
        <p>Click <a href="" onClick={(e) => {e.preventDefault(); e.stopPropagation(); history.back()}}>here</a> to go back</p>
    </div>
}

let _: page = {
    page,
    title: "Not Found",
    urls: [],
    styles: [require("../../css/error.scss")]
}

export = _
