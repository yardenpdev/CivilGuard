
'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
  addUser: async (req, res, next) => {
    console.log("AddUser")

    const user_name = req.body.user_name
    const user_id = req.body.user_id
    const success = await dao.insertUser(user_id, user_name)
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({success}));
  },
  
  setSubjects: async (req, res, next) => {
    console.log("setSubjects")

    // get parametars 
    var user_id = req.body.user_id;
    var subjects = req.body.subjects;
    const success = await dao.addSubjectsToUser(user_id, subjects);
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({success}));
  },
  
  getSubjects: async (req, res, next) => {
    console.log("getSubjects")
    const subjects = await dao.getUserSubjects(req.body.user_id);
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({subjects}));
  }
}