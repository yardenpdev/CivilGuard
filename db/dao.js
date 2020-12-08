const { Client } = require('pg')
const client = new Client({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DB || 'mishmar',
    password: process.env.PG_PASSWORD || 'zxcv0ZXC',
    port: process.env.PG_PORT || 3211,
  })
client.connect()

class DAO {

    async getRemarksOfSession(session_id) {
        console.log('DAO - getRemarksOfSession');
        return client
        .query('SELECT * from remarks where session_id = $1', [session_id])
        /// chenge to group_by
        .catch(e => {console.error(e.stack); return false})
    }

    async addRemarkToSession(user_id, session_id, remark) {
        console.log('DAO - addRemarkToSession');
        var date_added = new Date();
        return client
        .query('INSERT INTO remarks(user_id, text, time_inserted, session_id) VALUES($1, $2, $3, $4)',
                 [user_id, remark, date_added, session_id])
        .then(res => res.rowCount == 1)
        .catch(e => { console.error(e.stack); return false;});
    }

    async setSubjectsToUser(user_id, subjects) {
        console.log('DAO - addSubjectsToUser');
        return client
        .query("UPDATE users SET subjects = $1 WHERE user_id = $2",
                 [subjects, user_id])
        .then(res => res.rowCount == 1)
        .catch(e => { console.error(e.stack); return false;});
    }

    async getUserSubjects(user_id) {
        console.log('DAO - getUserSubjects')

        return client
        .query('SELECT * from users where user_id = $1', [user_id])
        .then(response => response.rows.length > 0 ? response.rows[0].subjects: false)
        .catch(e => {console.error(e.stack); return false})
    }
    
    async insertUser(user_id, user_name) {
        console.log('DAO - insertUser');
        var date_added = new Date();

        return client
        .query('INSERT INTO users(user_id, name, date_created, subjects, last_updated) VALUES($1, $2, $3, $4, $5)',
                 [user_id, user_name, date_added, [], date_added])
        .then(res => res.rowCount == 1)
        .catch(e => { console.error(e.stack); return false;});
    }

    async addSessionSubjectRelation(session, subject) {
        console.log('DAO - addSessionSubjectRelation');
        return client
        .query('INSERT INTO session_subject(session, subject) VALUES($1, $2)',
                 [session, subject])
        .then(res => res.rowCount == 1)
        .catch(e => { console.error(e.stack); return false;});
    }

    async removeSessionSubjectRelation(session, subject) {
        console.log('DAO - removeSessionSubjectRelation');
        return client
        .query('DELETE FROM session_subject WHERE session=$1 AND subject=$2',
                 [session, subject])
        .then(res => res.rowCount == 1)
        .catch(e => { console.error(e.stack); return false;});
    }

    async getSubjectsOfSession(session_id) {
        console.log('DAO - getSessionSubjects')

        return client
        .query('SELECT subject from session_subject where session = $1', [session_id])
        .then(response => response.rows.map(row => row.subject))
        .catch(e => {console.error(e.stack); return false})
    }
    async getSessionsOfSubjects(subjects) {
        console.log('DAO - getSessionsOfSubjects')

        return client
        .query('SELECT session from session_subject where subject = ANY($1)', [subjects])
        // TODO add group_by
        .then(response => response.rows.map(row => row))
        .catch(e => {console.error(e.stack); return false})
    }

}

var dao = new DAO();
// dao.getRemarksOfSession(11)
// const response = dao.addRemarkToSession(1, 11, "hello world remark");
// const response = dao.insertUser(1, 'yarden');
// const response = dao.getSubjects(1);
// const response = dao.setSubjectsToUser(1, ['hello', 'subject']);
// const response = dao.addSessionSubjectRelation('session_id_examp', 'subject_examp_3');
// const response = dao.getSessionSubjects('session_id_examp');
// const response = dao.getSessionsOfSubjects(['subject_examp', 'subject_examp_2']);
// response.then(res => console.log(res));


module.exports = DAO;
