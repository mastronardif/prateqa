var util    = require('util');
var session = require('client-sessions');
var assert  = require('assert');


module.exports.advancedSearch = function(req, res) {
	res.render('advancedSearch/new');
};
