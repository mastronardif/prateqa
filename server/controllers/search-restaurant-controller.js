var Q = require('q');
var yelp = require('../../lib/yelp');
var moment = require('moment');

module.exports.searchForm = function (req, res) {
    if (req.session && req.session.user) { // Check if session exists
        res.render('restaurantsearch/index', {
            account: req.session.user,
            count: null,
            searchResult: null,
            errorMessage: null
        });
    }
    else {
        res.redirect('/login');
    }
};


module.exports.searchByName = function (req, res) {
    var input = req.body.basicsearchinput;
    var db = req.db;
    var count = 0;
    var result = {};
    var errorMessage = "";
    if (input === '') {
        errorMessage = "Please enter a restaurant name. ";
    }
    db.collection("venues").find({name: new RegExp(input, 'i')}).count()
        .then(function (count) {
            var resultArray = [];
            if (count === 0) {
                //console.log("Not found");
                errorMessage = input + " is not found";
                res.render('restaurantsearch/index', {
                    account: req.session.user,
                    count: 0,
                    searchResult: [],
                    errorMessage: errorMessage
                });
            }
            else {
                //console.log("found it");
                var cursor = db.collection("venues").find({name: new RegExp(input, 'i')});
                cursor.forEach(function (doc, err) {
                    resultArray.push(doc);
                }, function () {
                    if (req.session && req.session.user) { // Check if session exists
                        res.render('restaurantsearch/index', {
                            account: req.session.user,
                            count: count,
                            searchResult: resultArray,
                            errorMessage: errorMessage
                        });
                    }
                    else {
                        res.redirect('/login');
                    }

                });
            }
        });
};

module.exports.saveDeal = function (req, res) {
    //res.send("Save deals");

    var item = [{
        yelpdealid: req.body.deal_id,
        timestart: req.body.time_start,
        restaurantid: req.body.id
    }];

    var db = req.db;
    if (req.session && req.session.user) { // Check if session exists
        var user_id = req.session.user.href; // Hard coded for now. Should get it from sessionVars
        db.collection('profile').updateOne({"href": user_id}, {$set: {"deals": item}})
            .then(function (data) {
                //console.log(data);
            });
        res.redirect('/basicsearch/restaurant');
    }
    else {
        res.redirect('/login');
    }
};

module.exports.searchByID = function (req, res) {
    var businessID = req.param('id');
    var returnResult = {};
    var db = req.db;

    getRestaurant(businessID, db)
        .then(function (data) {
            //var externalBusinessID = data.external[0]._id;
            var externalBusinessID = 'le-village-new-york';
            //console.log('got data with Q promise', externalBusinessID);
            returnResult.business = data;
            return externalBusinessID;
        })
        .then(function (externalID) {
            returnResult.externalID = externalID;
            yelp.getBusiness(externalID)
                .then(function (data) {
                    returnResult.yelpData = data;
                    var time_start = data.deals[0].time_start;
                    var time_start_dateformat = moment.unix(time_start).format("MM/DD/YYYY");
                    returnResult.time_start_dateformat = time_start_dateformat;
                    //console.log('got search result', returnResult);
                    if (req.session && req.session.user) { // Check if session exists
                        res.render('restaurantsearch/detail', {
                            account: req.session.user,
                            output: returnResult
                        });
                    } else {
                        res.redirect('/login');
                    }
                })
                .catch(function (error) {
                    console.error('error on yelp search', error);
                });
        })
        .catch(function (error) {
            console.log('getting error from promise', error);
        })
        .finally(function () {
            console.log('done');
        });
};

var getRestaurantByID = function (id, db, callback) {
    db.collection('venues').findOne({"_id": id}, function (err, document) {
        //console.log('results from database:', document);
        callback(err, document);
    });
};

var getRestaurant = function (id, db) {
    //console.log("id:   " + id);
    var deferred = Q.defer();
    getRestaurantByID(id, db, function (err, data) {
        if (err) {
            deferred.reject(err);
            //console.log("error: " + id);
        }
        else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};



