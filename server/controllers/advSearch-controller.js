var util    = require('util'),
    session = require('client-sessions'),
    assert  = require('assert');


module.exports.advancedSearch = function(req, res) {
	res.render('advancedSearch/new');
};
