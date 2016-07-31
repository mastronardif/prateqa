'use strict';
var util = require('util');
var session = require('client-sessions');
//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost:27017/platerate';
var assert = require('assert');
//var db;

// Initialize connection once
// MongoClient.connect(url, function(err, database) {
  // if(err) throw err;
  // console.log("ZZZZZZZZZZZ Connected correctly to server.");
  // db = database;
// });

module.exports.showForm = function (req, res) {
  console.log("showing form in basicsearch");
  var account;
  if (req.session && req.session.user) { // Check if session exists
    console.log("A user is logged in!");
    account = req.session.user;
    console.log(account);
    console.log(account.fullName);
    //window.document.getElementById("registerorlogindiv").setAttribute('class','hidden');
  }
  else{
    account = "";
    console.log("accoun obj is empty");
    // $("#registerorlogindiv").show();
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
}

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

/***
    req.db.collection('testData').find({}, function(err, docs) {
    docs.each(function(err, doc) {
      if(doc) {
        console.log(doc);
      }
      else {
        console.log('none found');
      }
    });

  });
***/

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
        /****
    res.render('basicsearchresults/searchfoodresults',
               {
                 query: qry,
                 data : data
               });
               ****/

}

//print out error messages
function printError(error){
  console.error(error.message);
};

module.exports.searchMenuItems = function (req,res) {
  var finalArray = [];
  var toPrintArray = [];
  var input = req.body.basicsearchinput;
  var inputTokens = input.split(" "); //returns an array
  var cursor = req.db.collection("venueMenus").find({});
  cursor.each(function(err, venue) {
    assert.equal(null, err);
    if(venue != null){
      console.log("A new venueeeeee!");
      var sectionCounter = venue.menus[0].entries.count;
      for(var i=0; i<sectionCounter; i++){
        var matchCount = [];
        var sectionName = venue.menus[0].entries.items[i].name;
        var sectionNameTokens = sectionName.split(" ");
        var matchingSection=0;
        for(var x=0;x<sectionNameTokens.length;x++){
          for(var y=0;y<inputTokens.length;y++){
            if(sectionNameTokens[x]===inputTokens[y]){
              matchingSection+=1;
            }
          }
        } //for loop for sectionCounter
        var itemCounter = venue.menus[0].entries.items[i].entries.count;
        for(var j = 0; j < itemCounter; j++){
          var itemName = venue.menus[0].entries.items[i].entries.items[j].name;
          var itemNameTokens = itemName.split(" ");
          var matchingItem = 0;
          for(var a=0;a<itemNameTokens.length;a++) {
            for(var b=0;b<inputTokens.length;b++){
              if(itemNameTokens[a]===inputTokens[b]){
                matchingItem = matchingItem+1;
              }
            }
          }
          var totalMatched = matchingSection + matchingItem;
          matchCount[j] = totalMatched;
          if(matchCount[j]>0){
            toPrintArray.push(venue.menus[0].entries.items[i].entries.items[j]);
          }
        } //for loop for itemCounter
        console.log("Array of Points each item has accumulated: [ " + matchCount +" ]");
      } //for loop for sectionCounter
      for(var k=0; k<toPrintArray.length;k++){
        console.log("Array of items  ::  " + toPrintArray[k].name );
      }
    } //if venue is null
    }) //cursor.each
    res.render('basicsearchresults/new');
}
