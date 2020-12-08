const { Client } = require('pg')
const client = new Client({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DB || 'mishmar',
    password: process.env.PG_PASSWORD || 'zxcv0ZXC',
    port: process.env.PG_PORT || 3211,
  })
client.connect()

async function createDB() {
    try {
        await client.query(
            "CREATE TABLE remarks (user_id  varchar(80), text text, time_inserted date, session_id varchar(8));"
        )

        await client.query(
            "CREATE TABLE users (user_id  varchar(80) PRIMARY KEY, name varchar(80), date_created date, subjects varchar(32)[], last_updated date);"
        )

        await client.query(
            "CREATE TABLE session_subject (session  varchar(80), subject varchar(80));"
        )
    } catch (e) {
        console.error(e)
    }
}

createDB()