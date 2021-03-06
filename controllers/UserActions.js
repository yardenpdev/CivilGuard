'use strict';

// const ks_module = require('../services/KnesetService.js');
// const ks = new ks_module();

const DAO = require('../db/dao.js')
const dao = new DAO();

module.exports = {
  addRemark: async (req, res, next) => {
    console.log("addRemark");
    if (!req.user) {
        res.status(401).send('Unaothorized')
        return
    }

    const user_id = req.user.id
    const session_id = req.body.session_id
    const remark = req.body.remark

    const success = await dao.addRemarkToSession(user_id, session_id, remark);
    console.log(success);

    res.header('Content-Type', 'application/json')

    res.end(JSON.stringify({success}));
  },
  
  deleteRemark: async (req, res, next) => {
    console.log("deleteRemark");
    if (!req.user) {
        res.status(401).send('Unaothorized')
        return
    }

    console.log(req.body)

    const user_id = req.user.id
    const session_id = req.body.session_id
    const remark = req.body.remark

    const success = await dao.deleteRemark(user_id, session_id, remark);

    res.header('Content-Type', 'application/json')

    res.end(JSON.stringify({success}));
  },
  
  getRemarks: async (req, res, next) => {
    console.log("getRemarks");
    // get committee details - api call
    const session_id = req.query.session_id;
    const remarks = await dao.getRemarksOfSession(session_id);
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({remarks}));
  }
}

