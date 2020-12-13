
'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
  insertOrUpdateUser: user => dao.insertOrUpdateUser(user),

  updateUserProfile: async (req, res, next) => {
    console.log("updateUserProfile")
    const {name, photo, email} = req.body
    if (!req.user) {
      res.status(401)
      res.send('unauthorized')
      return
    }

    Object.assign(req.user, {name, photo, email})

    const success = await dao.updateUserProfile(req.user.id, {name, photo, email});
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({success}));
  },
  
  setSubjects: async (req, res, next) => {
    console.log("setSubjects")
    if (!req.user) {
      res.status(401)
      res.send('unauthorized')
      return
    }

    // get parametars 
    var user_id = req.user.id;
    var subjects = req.body.subjects;
    const success = await dao.addSubjectsToUser(user_id, subjects);
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({success}));
  },
  
  getSubjects: async (req, res, next) => {
    if (!req.user) {
      res.status(401)
      res.send('unauthorized')
      return
    }
    console.log(`getSubjects for ${req.user.id}`)
    const subjects = await dao.getUserSubjects(req.user.id)
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({subjects}));
  }
}