
// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
    getSubjects: async(req, res, next) => {
        console.log("getSubjects")
        const session_id = req.session_id
        const subjects = await dao.getSubjectsOfSession(session_id)
        res.end(JSON.stringify({subjects}))
    },

    addSessionSubject: async (req, res, next) => {
        console.log("addSessionSubject")
        const subject = req.param('subject')
        const session_id = req.param('session_id') 
        const success = await dao.addSessionSubjectRelation(subject, session_id)
        res.end(JSON.stringify({success}))
    },
    
    removeSessionSubject: async (req, res, next) => {
        console.log("addSessionSubject")
        const subject = req.param('subject') 
        const session_id = req.param('session_id')
        const success = await dao.removeSessionSubjectRelation(subject, session_id)
        res.end(JSON.stringify({success}))
    }
}
