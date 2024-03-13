import react = require('react')
import dtypes = require("discord-api-types/v10")
import customizer = require("../customize_config")
import types = require('main/types')

interface entry_props {
    config_key: string,
    value: types.jsonable,
    config_path?: string,
    on_change?: (path: string, value: types.jsonable) => any
}

interface obj_props extends entry_props {
    value: Record<string, any>
}

interface array_props extends entry_props {
    value: types.jsonable[]
}

let getEnums = (config_path: string): string[] | null => {
    if (/Activities\.Item [0-9]+\.type/.exec(config_path)) {
        return Object.keys(dtypes.ActivityType).filter(v => isNaN(parseInt(v)))
    }

    if (config_path == "DBType") {
        return [
            "sqlite",
            "mariadb",
            "mysql",
            "postgres",
            "mssql"
        ]
    }
    return null
}

let ObjectEntry = ({config_key, value, config_path, on_change}: obj_props) => {
    let elements: React.JSX.Element[] = []
    for (let key of Object.keys(value)) {
        elements.push(
            <Entry config_path={config_path} key={key} config_key={key} value={
                customizer.from(key, value[key])
            } on_change={on_change}/>
        )
    }

    return <div className="card">
        {config_key != ' ' ? <div className="card-header">
            {config_key}
        </div> : ''}
        <ul className="list-group">
            {elements.map(e => <li className="list-group-item" key={e.key}>
                {e}
            </li>)}
        </ul>
    </div>
}

let ArrayEntry = ({config_key, value, config_path, on_change}: array_props) => {
    let elements: React.JSX.Element[] = []
    let customized = customizer.from(config_key as keyof types.Config, value) as typeof value
    for (let i = 0; i < customized.length; ++i) {
        let indexed = customized[i]
        elements.push(<Entry config_path={config_path} key={`${config_key}_${i}`} 
            value={indexed}
            config_key={`Item ${i}`}
        on_change={on_change} />)
    }
    return <div className="card">
        {config_key != ' ' ? <div className="card-header">
            {config_key}
        </div> : ''}
        <ul className="list-group">
            {elements.map(e => <li className="list-group-item" key={e.key}>
                {e}
            </li>)}
        </ul>
    </div>
}

// TODO: add ablility to add new items into array and object types
let Entry = ({config_key, value, config_path, on_change}: entry_props) => {
    let value_element: React.JSX.Element | React.JSX.Element[]
    let entry_type
    let [internal_value, _set_value] = react.useState(value)

    if (!config_path) {
        config_path = config_key
    } else {
        config_path = config_path + '.' + config_key
    }

    let set_value = (value: types.jsonable) => {
        if (on_change) {
            on_change(config_path!, value);
        }
        _set_value(value)
    }

    if (internal_value instanceof Array) {
        value_element = <ArrayEntry config_path={config_path} config_key={config_key} value={internal_value} on_change={on_change} />
    } else if (typeof internal_value == 'object') {
        value_element = <ObjectEntry config_path={config_path} config_key={config_key} value={internal_value} on_change={on_change} />
    } else {
        let customized = customizer.from(config_key, internal_value) as Exclude<types.jsonable, Record<string, any> | any[]>
        entry_type = typeof customized
        switch (typeof customized) {
            case "string": {
                let valid_values = getEnums(config_path)
                if (valid_values) {
                    value_element = <select className='form-select' title={config_key} defaultValue={value as string} onChange={e => set_value(e.target.value)}> 
                        {valid_values.map(v => <option
                            value={v}
                            label={v}
                            key={v}
                         />)}
                    </select>
                } else {
                    value_element = <textarea
                        rows={2}
                        style={{flexGrow: 1}}
                        defaultValue={customized}
                        onChange={(e) => set_value(e.target.value)}
                    />
                }
                break
            }
            case "number":
                value_element = <input
                    style={{ flexGrow: 1 }}
                    type="number"
                    className="form-control"
                    aria-describedby={config_key + "_" + entry_type}
                    defaultValue={customized}
                    onChange={(e) => set_value(e.target.valueAsNumber)}
                />
                break
            case "boolean": {
                value_element = <button 
                    type="button" 
                    className={`form-control btn btn-${internal_value ? "success" : "danger"}`}
                    aria-describedby={config_key + "_" + entry_type}
                    defaultChecked={customized}
                    title={internal_value.toString()}
                    onClick={() => set_value(!internal_value)}>
                    {internal_value ? "Enabled" : "Disabled"}
                </button>
                break
            }
            default: {
                value_element = <>Error</>
            }
        }
    }

    let prefix: JSX.Element = <></>
    if (entry_type == 'string') {
        prefix = <span id={config_key + "_" + entry_type} className="input-group-text">{config_key}</span>
    } else if (entry_type == 'boolean' || entry_type == 'number') {
        prefix = <span style={entry_type == 'boolean' ? {flexGrow: 5} : {}} id={config_key + "_" + entry_type} className="input-group-text">{config_key}</span>
    }

    return <div className="entry">
            {prefix}
            {value_element}
        {/* {config_key ? <pre>{config_key == ' ' ? '' : indenter(config_key, indent) + ":"} </pre> : ''} */}
    </div>
}

export = Entry
