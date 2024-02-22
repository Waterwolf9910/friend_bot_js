import fs = require("fs")
import path = require("path")
import _sequelize = require("sequelize")
import Logger = require("./logger")
let sequelize: typeof _sequelize.Sequelize.prototype
let console = new Logger()
// console.log(1, fs.readdirSync(path.resolve()), 2, fs.readdirSync(path.resolve("..")))
let config: import("../types").Config = JSON.parse(fs.readFileSync(path.resolve("config.json"), { encoding: 'utf-8' }))
let log = (str: string) => {
    fs.appendFileSync(path.resolve("db_debug.log"), `${str}\n`)
}
if (config.DBType.toLowerCase() == "sqlite" || config.DBType.toLowerCase() == "sqlite3") {
    sequelize = new _sequelize.Sequelize({ username: config.DBUser, database: config.DBName, password: config.DBPassword, dialect: "sqlite", dialectModule: require("sqlite3"), storage: config.DBFile, define: {freezeTableName: true, charset: "utf-8"}, logging: log })
} else if (config.DBType.toLowerCase() == "mariadb") {
    sequelize = new _sequelize.Sequelize({ username: config.DBUser, database: config.DBName, password: config.DBPassword, dialect: "mariadb", dialectModule: require("mariadb"), host: config.DBHost, port: config.DBPort, pool: {acquire: 20000}, retry: {max: 5}, ssl: config.DBUseSSL, define: { freezeTableName: true, charset: "utf-8" }, logging: log })
} else if (config.DBType.toLowerCase() == "mysql" || config.DBType.toLowerCase() == "mysql2") {
    sequelize = new _sequelize.Sequelize({ username: config.DBUser, database: config.DBName, password: config.DBPassword, dialect: "mysql", dialectModule: require("mariadb"), host: config.DBHost, port: config.DBPort, pool: { acquire: 20000 }, retry: { max: 5 }, ssl: config.DBUseSSL, define: { freezeTableName: true, charset: "utf-8" }, logging: log })
} else if (config.DBType.toLowerCase() == "pg" || config.DBType.toLowerCase() == "postgres" || config.DBType.toLowerCase() == "postgresql") {
    sequelize = new _sequelize.Sequelize({ username: config.DBUser, database: config.DBName, password: config.DBPassword, dialect: "postgres", dialectModule: require("pg"), host: config.DBHost, port: config.DBPort, pool: { acquire: 20000 }, retry: { max: 5 }, ssl: config.DBUseSSL, define: { freezeTableName: true, charset: "utf-8" }, logging: log })
} else if (config.DBType.toLowerCase() == "mssql" || config.DBType.toLowerCase() == "tedious") {
    sequelize = new _sequelize.Sequelize({ username: config.DBUser, database: config.DBName, password: config.DBPassword, dialect: "mssql", dialectModule: require("tedious"), host: config.DBHost, port: config.DBPort, pool: { acquire: 20000 }, retry: { max: 5 }, ssl: config.DBUseSSL, define: { freezeTableName: true, charset: "utf-8" }, logging: log })
} else {
    sequelize = new _sequelize.Sequelize({ username: config.DBUser, database: config.DBName, password: config.DBPassword, dialect: "sqlite", dialectModule: require("sqlite3"), storage: config.DBFile, define: { freezeTableName: true, charset: "utf-8" }, logging: log })
}

import util = require("util")
let guild_configs = sequelize.define<import("../types").GuildConfig>("guild_configs", {
    id: {
        allowNull: false,
        type: _sequelize.STRING,
        unique: true,
        primaryKey: true
    },
    econ_managers: {
        allowNull: false,
        type: _sequelize.TEXT,
        get() {
            return this.getDataValue("econ_managers") ? JSON.parse(this.getDataValue("econ_managers")) : []
        },
        set(val) {
            if (typeof val !== "object") {
                throw new Error(`${util.format(val)} is not a object`)
            }
            this.setDataValue("econ_managers", JSON.stringify(val))
        },
        defaultValue: "[]"
    },
    config_managers: {
        allowNull: false,
        type: _sequelize.TEXT,
        get() {
            return this.getDataValue("config_managers") ? JSON.parse(this.getDataValue("config_managers")) : []
        },
        set(val) {
            if (typeof val !== "object") {
                throw new Error(`${util.format(val)} is not a object`)
            }
            this.setDataValue("config_managers", JSON.stringify(val))
        },
        defaultValue: "[]"
    },
    xp: {
        allowNull: false,
        type: _sequelize.TEXT,
        get() {
            return this.getDataValue("xp") ? JSON.parse(this.getDataValue("xp")) : []
        },
        set(val) {
            if (typeof val !== "object") {
                throw new Error(`${util.format(val)} is not a object`)
            }
            this.setDataValue("xp", JSON.stringify(val))
        },
        defaultValue: "{}",
    },
    money: {
        allowNull: false,
        type: _sequelize.TEXT,
        get() {
            return this.getDataValue("money") ? JSON.parse(this.getDataValue("money")) : []
        },
        set(val) {
            if (typeof val !== "object") {
                throw new Error(`${util.format(val)} is not a object`)
            }
            this.setDataValue("money", JSON.stringify(val))
        },
        defaultValue: "{}",
    },
    other: {
        allowNull: false,
        type: _sequelize.TEXT,
        get() {
            return this.getDataValue("other") ? JSON.parse(this.getDataValue("other")) : []
        },
        set(val) {
            if (typeof val !== "object") {
                throw new Error(`${util.format(val)} is not a object`)
            }
            this.setDataValue("other", JSON.stringify(val))
        },
        defaultValue: "{}"
    }
}, {})

let user_logins = sequelize.define<import("../types").UserLogin>('user_logins', {
    id: {
        primaryKey: true,
        allowNull: false,
        type: _sequelize.STRING,
        unique: true,
        defaultValue: ""
    },
    access_token: {
        primaryKey: false,
        allowNull: false,
        type: _sequelize.STRING,
        unique: true,
        defaultValue: ""
    },
    refresh_token: {
        primaryKey: false,
        allowNull: false,
        type: _sequelize.STRING,
        unique: true,
        defaultValue: ""
    },
    scope: {
        primaryKey: false,
        allowNull: false,
        type: _sequelize.STRING,
        unique: false,
        defaultValue: ""
    },
    token_type: {
        primaryKey: false,
        allowNull: false,
        type: _sequelize.STRING,
        unique: false,
        defaultValue: ""
    },
    expire_time: {
        primaryKey: false,
        allowNull: false,
        type: _sequelize.STRING,
        unique: false,
        defaultValue: ""
    },
})

setInterval(async () => {
    console.log("[db.js] checking db auth")
    try {
        await sequelize.authenticate()
    } catch (err) {
        console.error("[db.js]", err)
    }
}, 60 * 30 * 1000).unref()

setInterval(async () => {
    if (!fs.existsSync(path.resolve(config.DBFile))) {
        await sequelize.sync()
    }
}, 5 * 1000).unref()

;(async () => {
    console.log("[db.js] checking db auth")
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (err) {
        console.error("[db.js]", err)
    }
})().then(() => {
    fs.watch(path.resolve(config.DBFile), {persistent: false}, async (event, file) => {
        if (!fs.existsSync(path.resolve(config.DBFile))) {
            await sequelize.sync()
        }
    })
})

export = {
    sequelize,
    guild_configs,
    user_logins
}
