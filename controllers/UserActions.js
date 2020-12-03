'use strict';

const { request } = require("http");

const ks_module = require('../services/KnesetService.js');
const dao_module = require('../db/dao.js');
const ks = new ks_module();
const dao = new dao_module();

module.exports.addRemark = function addRemark (req, res, next) {
  console.log("addRemark")

  var committee_id = req.param('committee_id');
  var remark = req.param('remark');

  var success = dao.addRemarkToSession(committee_id, remark, new Date());
  console.log(success);

  res.end(JSON.stringify({'success': success}));
};

module.exports.getRemarks = function getSessionRemarks (req, res, next) {
  console.log("getRemarks");

  // get committee details - api call
  var committee_id = req.committee_id;

  var remarks = dao.getRemarksOfCommittee(committee_id);
  // res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({'remarks': remarks}));
};

