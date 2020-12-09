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
        console.log(`DAO - getRemarksOfSession ${session_id}`);
        const res = await client
            .query('SELECT remarks.user_id as user_id, name, photo, text, time_inserted from remarks INNER JOIN users ON remarks.user_id=users.user_id where remarks.session_id = $1', [session_id])
        return res.rows
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

    async deleteRemark(user_id, session_id, remark) {
        console.log(`DAO - deleteRemark ${user_id} ${session_id} ${remark}`);
        return client
        .query('DELETE FROM remarks WHERE user_id=$1 AND session_id=$2 AND text=$3',
                 [user_id, session_id, remark])
        .then(res => res.rowCount == 1)
        .catch(e => { console.error(e.stack); return false;});
    }

    async setSubjectsToUser(user_id, subjects) {
        console.log('DAO - addSubjectsToUser');
        const res = await client.query("UPDATE users SET subjects = $1 WHERE user_id = $2",
                 [subjects, user_id])
        return res.rowCount === 1
    }

    async getUserSubjects(user_id) {
        console.log('DAO - getUserSubjects')
        const response = await client.query('SELECT * from users where user_id = $1', [user_id])
        return response.rows.length > 0 ? response.rows[0].subjects : []
    }
    
    async insertOrUpdateUser({id, name, photo, email}) {
        console.log('DAO - insertUser');
        var date_added = new Date();

        const exists = await client.query('SELECT user_id FROM users WHERE user_id=$1', [id])
        if (exists.rowCount === 1)
            return

        const res = await client.query('INSERT INTO users(user_id, name, email, photo, date_created, subjects, last_updated) VALUES($1, $2, $3, $4, $5, $6, $7)',
                    [id, name, email, photo, date_added, [], date_added])
        return res.rowCount == 1
    }

    async addSessionSubjectRelation(session, subject) {
        console.log('DAO - addSessionSubjectRelation');
        const res = await client
                            .query('INSERT INTO session_subject(session, subject) VALUES($1, $2)',
                            [session, subject])
        return res.rowCount === 1
    }

    async removeSessionSubjectRelation(session, subject) {
        console.log('DAO - removeSessionSubjectRelation');
        const res = await client
            .query('DELETE FROM session_subject WHERE session=$1 AND subject=$2',
                 [session, subject])
        return res.rowCount === 1
    }

    async getSubjectsBySession(session_id) {
        console.log('DAO - getSessionSubjects')
        const response = await client.query('SELECT subject from session_subject where session = $1', [session_id])
        return response.rows.map(row => row.subject)
    }

    async getAllSubjects() {
        console.log('DAO - getAllSubjects')
        const response = await client.query('SELECT * from subject')
        return response.rows.map(s => s.title)
    }

    async addSubject(subject) {
        console.log('DAO - addSubject')
        const response = await client.query('INSERT INTO subject (title) VALUES($1)', [subject])
        return response.rows
    }

    async deleteSubject(subject) {
        console.log('DAO - addSubject')
        const response = await client.query('DELETE FROM subject WHERE title=$1', [subject])
        if (response.rowCount !== 1)
            return false

        response2 = await client
            .query('DELETE FROM session_subject WHERE subject=$1',
                 [subject])

        return true
    }

    async getSessionsBySubject(subjects) {
        console.log('DAO - getSessionsOfSubjects')
        const response = await client.query('SELECT session from session_subject where subject = ANY($1)', [subjects])
        return response.rows
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
