
// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
    getSubjects: async(req, res, next) => {
        const {session_id} = req.query
        console.log(`getSubjects for ${session_id}`)
        const subjects = await dao.getSubjectsBySession(session_id)
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify({subjects}))
    },

    addSessionSubject: async (req, res, next) => {
        console.log("addSessionSubject")
        const {session_id, subject} = req.body
        const success = await dao.addSessionSubjectRelation(session_id, subject)
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify({success}))
    },
    
    removeSessionSubject: async (req, res, next) => {
        console.log("delSessionSubject")
        const {session_id, subject} = req.body
        const success = await dao.removeSessionSubjectRelation(session_id, subject)
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify({success}))
    }
}
