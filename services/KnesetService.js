const http = require('http')
const parser = require("odata-parser");

function KnessetService() {
    this.serviceRoot = 'knesset.gov.il';
    this.prePath = '/Odata/ParliamentInfo.svc/';
    this.servicePerUrl = this.serviceRoot + this.prePath;

    const options = {
        hostname: this.serviceRoot,
        // port: 443,
        // path: this.prePath,
        method: 'GET',
        headers: {
        //   'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }

    this.createFilterQuery = function(field, value) {
        return 'filter='+field+'%20eq%20'+value
    }

    this.getURL = function(path) {
        console.log(path);
        var optionLocal = Object.assign({}, options);
        optionLocal.method = 'GET';
        optionLocal.path = this.prePath + path.replace(/\s/g, '%20')
        console.log(optionLocal.hostname + optionLocal.path);
        var body = '';
        http.get(optionLocal, function (response) {
            response.on('data', function (chunk) {
                body+=chunk;
            });
            response.on('end', function () {
                var data = JSON.parse(body);
                console.log(JSON.stringify(data, null, 4));
                // console.log(parser.parse(body));
            });
        }).on('error', function(e) {
            console.log('ERROR: ' + e.message);
        });
    }

    this.getNumBillCount = function() {
        var path ='KNS_Bill()/$count';
        this.getURL(path);
    }

    this.KNS_Committee = function(committeId) {
        var committeeIdLocal = committeId || ''
        var path = 'KNS_Committee('+committeeIdLocal+')';
        this.getURL(path);
    }

    this.KNS_Agenda = function(arg1) {
        var path = 'KNS_Agenda()/' + arg1;
        this.getURL(path);
    }

    this.getCommittieesSessions = function(committeeID) {
        var path = 'KNS_CommitteeSession()?$' + this.createFilterQuery('CommitteeID', committeeID);
        this.getURL(path);
    }

    this.createDateFormatOData = function(date) {
        return 'DateTime\''+ (date.toJSON().slice(0, 19)) +'\'';
    }

    this.createFilterByDates = function(fromDate, untilDate) {
        return '$filter=' 
        +'StartDate gt '+this.createDateFormatOData(fromDate) 
        + ' and '
        + 'StartDate lt '+this.createDateFormatOData(untilDate)
        + '&$orderby=StartDate'
    }

    this.getCommittieesInDates = function(fromDate, untilDate) {
        var path = 'KNS_CommitteeSession()?' + this.createDateFormatODates(fromDate, untilDate);
        console.log(path)
        this.getURL(path);
    }

    this.getCommitteeSessionDetails = function(committeeSessionId) {
        var path = 'KNS_CmtSessionItem()?$filter=CommitteeSessionID%20eq%20' + committeeSessionId;
        this.getURL(path);
    }

    this.getItemType = function(itemTypeId) {
        // var path = 'KNS_ItemType()?$filter=ItemTypeID%20eq%20' + itemTypeId;
        var path = 'KNS_ItemType()';
        this.getURL(path);
    }

    this.getItemStatus = function(itemStatusID) {
        var path = 'KNS_Status()';
        this.getURL(path);
    }

    this.test_expend = function() {
        var today = new Date();
        var nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);
        var path = 'KNS_CommitteeSession/?'
         + this.createFilterByDates(today, nextWeek)
         + '$expand=';
        this.getURL(path);
        console.log(nextWeek)
    }
}


module.exports = KnessetService;

// var ks = new KnessetService();
// var today = new Date();
// var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);
// console.log(today)
// console.log(nextweek)
// ks.getCommittieesInDates(today, nextweek);

// ks.getCommitteeSessionDetails(2149931);
// ks.getCommitteeSessionDetails(2149864);

// 2149887 item Id -- what is that??
// ks.getItemType(2149887)

// ks.getItemType()
// ks.getItemStatus()


// next filter in expend
// ks.test_expend()