const mysql = require('mysql2')

const { DB_HOST, DB_BASE, DB_USER, DB_PASS } = process.env

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_BASE,
    password: DB_PASS,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
})

const db = pool.promise()

module.exports = db