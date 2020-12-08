const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'knesetAPIDB',
    password: 'zxcv0ZXC',
    // port: 3211,
  })
client.connect()

client
.query(
    "CREATE TABLE remarks (user_id  varchar(80), text text, time_inserted date, session_id varchar(8));"
)
.catch(e => console.error(e.stack))

client
.query(
    "CREATE TABLE users (user_id  varchar(80) PRIMARY KEY, name varchar(80), date_created date, subjects varchar(32)[], last_updated date);"
)
.catch(e => console.error(e.stack))

client
.query(
    "CREATE TABLE session_subject (session  varchar(80), subject varchar(80));"
)
.catch(e => console.error(e.stack))