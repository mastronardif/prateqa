'use strict';
var util = require('util');
var Fuse = require('fuse.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/platerate';
var session = require('client-sessions');
var assert = require('assert');
var options = {
    caseSensitive: false,
    includeScore: true,
    threshold: 0.3,
    keys: ['name']
};

// Loads homepage/basicsearch page
module.exports.showForm = function (req, res) {
    console.log("showing form in basicsearch");
    var account;
    if (req.session.user && req.session) { // Check if session exists
        console.log("A user is logged in!");
        account = req.session.user;
    }
    else {
        account = "null";
    }
    res.render('basicsearch/new', {account: account});
};

module.exports.searchAdvanced = function (req, res) {
    console.log(req.query);
    console.log(JSON.stringify(req.body));
    var results = {'query': req.query, 'body': req.body};

    res.render('basicsearchresults/searchfoodresults',
        {
            query: 'Advanced search',
            data: results
        });
};

module.exports.searchFood = function (req, res) {
    console.log('search-controller.js, module.exports.searchFood');
    var results = {'query': req.query, 'body': req.body};
    console.log(JSON.stringify(results));
    //console.log('req.db = ', req.db.getName());
    console.log('req.myParisite = ', req.myParisite);
    //var collection = req.db.get('ratings');
    //db.getCollection('ratings').find({})

    req.db.collection('testData').find({}).toArray(function (err, results) {
        console.log(results); // output all records
        res.render('basicsearchresults/searchfoodresults',
            {
                query: qry,
                data: results
            });
    });
    //console.log(req.query);
    //console.log(JSON.stringify(req.body) );
    var qry = req.body.basicsearchinput;
    // TBD: model search, get food by _____.
    var data = [
        {
            name: 'Bloody Mary',
            id: 3,
            img: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQp1wzBRVW69V2wU-L77tI6ncSqr0Ib_iwmcxZLf06nSqPR-tPn'
        },
        {name: 'Martini', id: 5, img: ''},
        {name: 'Slim jim', id: 13, img: 'http://photos2.meetupstatic.com/photos/event/5/7/1/4/global_326602292.jpeg'},
        {
            name: 'Molson',
            id: 15,
            img: 'http://media.culturemap.com/crop/75/43/80x80/Mongers-Market-seafood_125343_jcrop_1x1_Thu12May2016151852.png'
        },
        {name: 'Whiskey Sour', id: 25, img: ''},
        {name: 'Titos Vodka', id: 23, img: ''},
        {name: 'Whiskey', id: 25, img: ''},
        {
            name: 'Scotch',
            id: 10,
            img: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT6Jo2RdmglLnl1UncNki5x0PjxYBx05XL_T5MkaD3NFqvASfVv'
        }
    ];

//   res.render('basicsearchresults/searchfoodresults',
//   {
//   query: qry,
//   data : data
// });

};

//print out error messages
function printError(error) {
    console.error(error.message);
}

//call Scrape.js before venueMenu Query
var venueMenusAggregate = function (db, userInput, callback) {
    console.log("The user input is: " + userInput);
    //Using aggregate Mongodb Aggregation Pipeline
    db.collection("venueMenus").aggregate([
        {$unwind: "$menus"},
        {$unwind: "$menus.entries.items"},
        {$unwind: "$menus.entries.items.entries.items"},
        {
            $project: {
                "fourSquareId": 1,
                "name": 1,
                "menus.name": 1,
                "menus.entries.items.name": 1,
                "menus.entries.items.entries.items.name": 1,
                "menus.entries.items.entries.items.entryId": 1,
                "menus.entries.items.entries.items.description": 1,
                "menus.entries.items.entries.items.price": 1
            }
        },
        //Searching only for certain words and phrases for now. Not case sensitive.
        {$match: {"menus.entries.items.entries.items.name": {$regex: userInput, $options: "i"}}}
    ]).toArray(function (err, result) {
        if(err) {
            console.log(err);
            callback(err, " ");
            return;
        }
        else {
            console.log("Before callbacK!!!!");
            callback(err, result);
        }
    });
};

module.exports.searchMenuItems = function (req, res) {
    var userInput = req.body.basicsearchinput;
    venueMenusAggregate(req.db, userInput, function (err, result) {
        console.log("inside the other function"+ result);
        if(err) {
            res.send(JSON.stringify(err));
            console.log("Some errorsss here!" + JSON.stringify(err) );
            return;
        }
        else {
            res.render('basicsearchresults/new', {result: result});
        }
    });
};