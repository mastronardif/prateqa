'use strict';
var util = require('util');
var session = require('client-sessions');
var assert = require('assert');

module.exports.ping = function (req, res) {
    console.log("ping-controller.ping");
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    var results = {'query': req.query, 'body':req.body};
    res.json(results);
    //res.send('echo '+ JSON.stringify(req.query) + JSON.stringify(req.body));
};

//print out error messages
function printError(error){
  console.error(error.message);
};

