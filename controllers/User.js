
'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

import DAO from '../db/dao.js';
const dao = new DAO();


module.exports.addUser = function addUser (req, res, next) {
  console.log("AddUser")

  var user_name = req.body.user_name;
  var user_id = req.body.user_id;

  var success = dao.insertUser(user_id, user_name);

  res.end(JSON.stringify({'success': success, 'user_id': user_id}));
};

module.exports.setSubjects = function setSubjects (req, res, next) {
  console.log("setSubjects")

  // get parametars 
  var user_id = req.body.user_id;
  var subjects = req.body.subjects;

  // add subjects to user register - DB write
  var success = dao.addSubjectsToUser(user_id, subjects);

  res.end(JSON.stringify({'success': success}));
};

module.exports.getSubjects = function getSubjects (req, res, next) {
  console.log("getSubjects")

  // get parametars 
  var user_id = req.query.user_id;

  // return all subjects user is registerd for - DB read
  var subjects = dao.getUserSubjects(user_id);

  // res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({'subjects': subjects}));
};