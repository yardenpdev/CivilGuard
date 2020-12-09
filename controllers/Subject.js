
'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
    addSubject: async (req, res, next) => {
        if (!req.user) {
            res.status(401).send('Unaothorized')
            return
        }
        console.log("addSubject")
        const success = await dao.addSubject(req.body.subject)
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify({success}));
    },

    deleteSubject: async (req, res, next) => {
        if (!req.user) {
            res.status(401).send('Unaothorized')
            return
        }
        console.log("deleteSubject")
        const success = await dao.deleteSubject(req.body.subject)
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify({success}));
    },

    getSubjects: async (req, res, next) => {
        console.log("getSubjects")
        const subjects = await dao.getAllSubjects();
        res.header('Content-Type', 'application/json')
        res.end(JSON.stringify({subjects}));
    }
}