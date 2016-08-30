var util = require('util');
//var httpsRD = require('follow-redirects').https;
'use strict';

module.exports.sendemail = function (req, res) {
    console.log('socialshare-controller.js, module.exports.sendemail');
    console.log(req.query);
    console.log(JSON.stringify(req.body));

    var results = {'query': req.query, 'body': req.body};
    //res.json(results);
    // you might want to do a partial on the socialshare screen.
    res.redirect('/socialshare');
}

//print out error messages
function printError(error) {
    console.error(error.message);
};
