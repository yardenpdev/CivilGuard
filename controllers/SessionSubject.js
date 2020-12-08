
// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

import DAO from '../db/dao.js';
const dao = new DAO();

module.exports.getSubjects = async function getSubjects (req, res, next) {
    console.log("getSubjects")
    const session_id = req.session_id;
  
    var subjects = await dao.getSubjectsOfSession(session_id);
    res.end(JSON.stringify({'subjets': subjects}));
};

module.exports.addSessionSubject = async function addSessionSubject (req, res, next) {
    console.log("addSessionSubject")
    const subject = req.param('subject');
    const session_id = req.param('session_id');
  
    var success = await dao.addSessionSubjectRelation(subject, session_id);
    res.end(JSON.stringify({'success': success}));
};

module.exports.getSessions = async function getSessions (req, res, next) {
    console.log("getSessions")
    const subjects = req.param('subjects');
  
    var sessions = await dao.getSessionsOfSubjects(subjects);
    res.end(JSON.stringify({'sessions': sessions}));
};