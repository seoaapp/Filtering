const Mysql = require('mysql')
class DB {
    constructor(host, user, pw, db) {
        this.pool = Mysql.createPool({
            host: host,
            user: user,
            password: pw,
            database: db
        })
    }

    select(table, where, add, callback) {
        let sql = `SELECT * FROM ${table} ${where ? 'WHERE ' + this.IV(where, { comma: 'AND' }) : ''} ${add || ''}`
        return callback ? callback(this.query(sql)) : this.query(sql)
    }

    IV(data, opt) {
        let sql = ''
        if (data) {
            const keys = Object.keys(data)
            if (!opt.key && !opt.val) opt.key = true, opt.val = true
            for (let i = 0; i < keys.length; i++) {
                if (opt.key) sql += keys[i]
                if (opt.val && opt.key) sql += ' = '
                if (opt.val) sql += `"${data[keys[i]]}"`
                if (i < keys.length - 1) sql += ` ${opt.comma} `
            }
        }
        return sql
    }

    update(table, data, where, callback) {
        if (!data) throw new Error()
        let sql = `UPDATE ${table} SET ${this.IV(data, { comma: ',' })} ${where ? 'WHERE ' + this.IV(where, { comma: 'AND'}) : ''}`
        return callback ? callback(this.query(sql, true)) : this.query(sql, true)
    }

    delete(table, data, callback) {
        let sql = `DELETE FROM ${table} ${data ? 'WHERE ' + this.IV(data, { comma: 'AND'}) : ''}`
        return callback ? callback(this.query(sql, true)) : this.query(sql, true)
    }

    insert(table, data, callback) {
        if (!data) throw new Error()
        let sql = `INSERT INTO ${table} (${this.IV(data, { comma: ',', key: true })}) VALUES (${this.IV(data, { comma: ',', val: true })})`
        return callback ? callback(this.query(sql, true)) : this.query(sql, true)
    }

    getConn() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (!err) resolve(conn)
                else reject(err)
            })
        })
    }

    query(sql, modified) {
        return new Promise((resolve, reject) => {
            this.getConn().then(conn => {
                conn[modified ? 'commit' : 'query'](sql, (err, rows, fields) => {
                    conn.release()
                    if (!err) resolve(rows)
                    else reject(err)
                })
            }).catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = DB