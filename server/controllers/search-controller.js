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
    keys:['name']
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
    res.render('basicsearch/new',{account:account});
};

module.exports.searchAdvanced = function (req, res) {
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    var results = {'query': req.query, 'body':req.body};

    res.render('basicsearchresults/searchfoodresults',
        {
            query: 'Advanced search',
            data : results
        });
};

module.exports.searchFood = function (req, res) {
    console.log('search-controller.js, module.exports.searchFood');
    var results = {'query': req.query, 'body':req.body};
    console.log(JSON.stringify(results) );
    //console.log('req.db = ', req.db.getName());
    console.log('req.myParisite = ', req.myParisite);
    //var collection = req.db.get('ratings');
    //db.getCollection('ratings').find({})

    req.db.collection('testData').find({}).toArray(function(err, results){
        console.log(results); // output all records
        res.render('basicsearchresults/searchfoodresults',
            {
                query: qry,
                data : results
            });
    });
    //console.log(req.query);
    //console.log(JSON.stringify(req.body) );
    var qry = req.body.basicsearchinput;
    // TBD: model search, get food by _____.
    var data = [
        { name: 'Bloody Mary', id: 3, img: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQp1wzBRVW69V2wU-L77tI6ncSqr0Ib_iwmcxZLf06nSqPR-tPn' },
        { name: 'Martini', id: 5, img: '' },
        { name: 'Slim jim', id: 13, img: 'http://photos2.meetupstatic.com/photos/event/5/7/1/4/global_326602292.jpeg'},
        { name: 'Molson', id: 15, img: 'http://media.culturemap.com/crop/75/43/80x80/Mongers-Market-seafood_125343_jcrop_1x1_Thu12May2016151852.png' },
        { name: 'Whiskey Sour', id: 25, img: '' },
        { name: 'Titos Vodka', id: 23, img: '' },
        { name: 'Whiskey', id: 25, img: '' },
        { name: 'Scotch', id: 10, img: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT6Jo2RdmglLnl1UncNki5x0PjxYBx05XL_T5MkaD3NFqvASfVv' }
    ];

//   res.render('basicsearchresults/searchfoodresults',
//   {
//   query: qry,
//   data : data
// });

};

//print out error messages
function printError(error){
    console.error(error.message);
};


module.exports.searchMenuItems = function(req, res, next) {
    var objResult = {};
    var finalarr = [];
    var fromvenue = [];
    var itemArray;
    var itemCounter;
    var sectionCounter;
    var sectionArray;
    var userinput = req.body.basicsearchinput;
    console.log("You Searched For: " + userinput);
    var cursor = req.db.collection('venueMenus').find({});
    cursor.each(function(err, doc) {
        assert.equal(null, err);
        if (!doc) {
            console.log(finalarr);
            //console.log(fromvenue);
            console.log("No more doc Found!");
            res.render('basicsearchresults/new', {  finalarr: finalarr } );
            return;
        }
        var menulength = doc.menus.length;
        for (var u = 0; u < menulength; u++) {
            sectionCounter = doc.menus[u].entries.count;
            sectionArray = doc.menus[u].entries.items;
            var sectionFuse = new Fuse(sectionArray, options);
            var sectionResult = sectionFuse.search(userinput);
            for (var i = 0; i < sectionCounter; i++) {
                itemArray = doc.menus[u].entries.items[i].entries.items;
                itemCounter = doc.menus[u].entries.items[i].entries.count;
                if (sectionResult.length !== 0) {
                    for (var j = 0; j < sectionResult.length; j++) {
                        if (sectionResult[j].sectionId === sectionArray[i].sectionId) {
                            //console.log("... dish Found in SectionName: " + sectionResult[j].name);
                            for (var k = 0; k < itemCounter; k++) {
                                objResult = {
                                    "Restaurant": doc.name,
                                    "section": sectionResult[j].name, //we could either display menuName or SectioName
                                    "item": itemArray[k]
                                }
                                fromvenue.push(objResult);
                            } //k loop
                        } //section matched
                    } //sectionResults
                    //else if no matching section, look into all items
                } else if (sectionResult.length === 0) {
                    var itemFuse = new Fuse(itemArray, options);
                    // if (itemFuse.length !== 0) {}
                    var itemResult = itemFuse.search(userinput);
                    for (var k = 0; k < itemResult.length; k++) {
                        objResult = {
                            "Restaurant": doc.name,
                            "item": itemResult[k]
                        }
                        fromvenue.push(objResult);
                    } // k loop for items
                } //else if (items only)
            } //section loop
        } //for
        finalarr = fromvenue.concat(itemResult);
    }); //cursor.each
};
