
'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();
const ROLES = {
  admin: 1, member: 2, anonymous: 3
}

module.exports = {
  insertOrUpdateUser: user => dao.insertOrUpdateUser(user),

  setUserRole: async (req, res, next) => {
    if (!req.user) {
      res.status(401)
      res.send('unauthorized')
      return
    }    

    const myRole = await dao.getUserRole(req.user.id)
    if (myRole !== ROLES.admin) {
      req.status(401)
      req.send('Unauthorized')
      return
    }

    const success = await dao.setUserRole(req.body.user_id, req.body.role)
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({success}));
  },

  getSelf: async (req, res, next) => {
    const me = req.user ? (await dao.getUser(req.user.id)) : null
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({user: me}));
  },

  getUsers: async (req, res, next) => {
    if (!req.user) {
      res.status(401)
      res.send('unauthorized')
      return
    }    

    const myRole = await dao.getUserRole(req.user.id)
    if (myRole !== ROLES.admin) {
      req.status(401)
      req.send('Unauthorized')
      return
    }

    const users = await dao.getUsers()
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({users}));
  },

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
    const success = await dao.setSubjectsToUser(user_id, JSON.parse(req.body.subjects));
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