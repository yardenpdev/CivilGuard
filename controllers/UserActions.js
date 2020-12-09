'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
  addRemark: async (req, res, next) => {
    console.log("addRemark");

    var session_id = req.param('session_id');
    var remark = req.param('remark');

    var success = await dao.addRemarkToSession(user_id, session_id, remark);
    console.log(success);

    res.header('Content-Type', 'application/json')

    res.end(JSON.stringify({success}));
  },
  
  getRemarks: async (req, res, next) => {
    console.log("getRemarks");
    // get committee details - api call
    const session_id = req.session_id;
    const response = await dao.getRemarksOfSession(session_id);
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({'remarks': response.rows[0].text}));
  }
}

