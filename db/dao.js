

function DAO () {

    this.getRemarksOfCommittee = function () {
        console.log('DAO - getRemarksOfCommittee');

        return ['hello', 'world'];
    }

    this.addRemarkToSession = function(committee_id, remark) {
        console.log('DAO - addRemarkToSession');
        var date_added = new Date();

        return false;
    }

    this.addSubjectsToUser = function(user_id, subjects) {
        console.log('DAO - addSubjectsToUser');

        return false;
    }

    this.getSubjects = function(user_id) {
        console.log('DAO - getSubjects')

        return ['hello', 'subjects']
    }

    this.userExists = function(user_id) {
        console.log('DAO - userExists');

        return false
    }

    this.insertUser = function(user_id, user_name) {
        console.log('DAO - insertUser');

        return false;
    }

}

module.exports = DAO;