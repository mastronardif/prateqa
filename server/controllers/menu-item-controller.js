'use strict';
var util = require('util');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var session = require('client-sessions');
var miOptions;
//var Venue = require('./myvenue');
var venueController    = require('./venue-controller');

module.exports.loadItem11 = function(req, res) {
    console.log("module.exports.loadItem");
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    
//    req.body.entryId = req.params.entryId;

  // req.body.lat = "40.652315";
  // req.body.lon": -74.344705,
  // req.body.radius": 460,
    req.body.venueId = req.body.fld_venueID;
    req.body.venueName = "The Great Burrito";
    req.body.entryId = req.params.entryId; //fld_menuItemID

    venueController.loadFromFsq(req, res, function(err, results){
        if(err) {
            console.log("S not found");
            var strErr = JSON.stringify(err);
            res.send('<h1>An Error Occurred' + strErr + '</h1>');
            //res.json({err: err, results: results});
        }
        else {
            //res.render('menuItems/prvenueview', results);
            console.log("\n\n results = \n");
            //console.log(results);
            res.render('menuItems/prvenueview', {
        venue: results.venue, 
        item: results.item,
        //tree: tree00,
        tree: results.tree,
        sliders: results.sliders,
        miOptions: results.miOptions
      });
            //res.json(results);
            //console.log("\n\n \t ********** results = \n");
            //console.log(results.venue);
            //console.log(results);
        }
    });
};
    
module.exports.loadItem = function(req, res) {
    console.log('module.exports.loadItem ');
    var entryId = req.params.entryId;
  
  console.log('\n\t\t **** entryId = ' + entryId);
  //console.log(req);
  console.log(req.query);
  console.log(JSON.stringify(req.body) );

  var col =  "venueMenus"; //"";// "testMenu"; // "venueMenus";
  req.db.collection(col).find({"menus.entries.items.entries.items.entryId": entryId})
                .toArray(function(err, menu){      
  
      if(err) {
        console.log("s not found");
         res.send('<h1>An Error Occurred </h1>');
         return;
    }
  
      if (err || menu == null || menu.length == 0) {          
          console.log('end ', err );
          res.send('<h1>Nothing found</h1>'); 
          return;
      }
      
      if (menu != null) {
        console.log(' menu:', menu.length);
      }
      else
      {
          console.log('menu:', 'nuLL');
      }
      
      
    console.log('Menu found! Name: ' + menu[0].name, "venueId = ", menu[0].venueId);
    //req.db.collection('venues').findOne({"name": menu[0].name}).then(function(venue){
        // use venueId !!!!!!!!!!!!!!!!
    //req.db.collection('venues').findOne({"name": menu[0].name}).then(function(venue){
    req.db.collection('venues').findOne({"venueId": menu[0].venueId}).then(function(venue){
      
    console.log('\n\nVenue found! Name: ' + venue.venue.name); //venue.name);
    //console.log(venue);
    //console.log(venue.venueId);
    
    var item = findItem(menu[0], entryId); //{}; //findItem(menu[0], entryId);
    console.log('Item found! Name: ' + item.name);
    //var tree = createFancyTreeMenu(menu[0]);
    var tree = createFancyTreeMenu(menu[0]);
    //console.log('tree = ', tree);
    
    //this is an object created to represent the information that was querid from the db about the menu
    miOptions = {        
       options: ["Yes", "No","Can Request?"],
       selectValue: ["Yes", "Yes", "Can Request?", "Yes", "No", "Can Request?","Yes", "No", "Can Request?", "Yes", "No", "Can Request?", "Yes", "No", "Can Request?"] //"Insomnia Cookies"    
   };
    
    var sliders = [10,20,30,40,50,60,70,80];
    //res.render('menuItems/new', {
    res.render('menuItems/prvenueview', {
        venue: venue.venue,  //venue: venue, 
        item: item,
        tree: tree,
        sliders: sliders,
        miOptions: miOptions
      });
    });
  });   // end to array
};

module.exports.updateValues = function(req, res) {

  //do a query to the database and find the object that you are referencing.
  var getValues = req.body;
  var obj = util.inspect(getValues.miOp);
  console.log("this is in updateValues");

  console.log(getValues.veganOption);
  res.redirect('/basicsearch');

};

var findItem = function(menu, entryId){
  var foundItem;
  //console.log('\n\t **** findItem ', menu, entryId); 
  //console.log(menu);
  //menu[0].menus.forEach(function (menu){
  menu.menus.forEach(function (menu22){
      //console.log('menu22 ', menu22);
    menu22.entries.items.forEach(function(item){
      item.entries.items.forEach(function(item22){
        if (item22.entryId === entryId){
          foundItem = item22;
          //////////////////////console.log('item22 ', item22);
        }
      })
    })
  })
  
  console.log('\n\t foundItem = ', foundItem);
  return foundItem
}

var createFancyTreeMenu = function(data){
    console.log("\n\t **** var createFancyTreeMenu = function(data){ \n");
    //console.log(data);
    
  var tree = [];
  data.menus.forEach(function(menu){
    if (menu.entries.count > 0){
    var menuObj = {};
    menuObj.title = menu.name;
    menuObj.folder = true;
    menuObj.children = [];
    menu.entries.items.forEach(function(innerMenu){
      if (innerMenu.entries.count > 0){
      var innerMenuObj = {};
      innerMenuObj.title = innerMenu.name;
      innerMenuObj.folder = true;
      innerMenuObj.children = [];
      innerMenu.entries.items.forEach(function(menuItem){
        menuItem.title = menuItem.name
        innerMenuObj = setMinandMax(innerMenuObj, menuItem)
        menuItem.price = "$".concat(menuItem.price)
        innerMenuObj.children.push(menuItem);
        });
      innerMenuObj = setRange(innerMenuObj)
      menuObj = setMinandMax(menuObj, innerMenuObj)
      menuObj.children.push(innerMenuObj);
    }
  });
    menuObj = setRange(menuObj)
    tree.push(menuObj)
  }});
  return JSON.stringify(tree);
};

var setMinandMax = function(outer, inner){
  if (inner.price){
    inner.maxPrice = inner.price
    inner.minPrice = inner.price
  }
  if(!outer.minPrice || parseInt(outer.minPrice) > parseInt(inner.minPrice)){
          outer.minPrice = inner.minPrice
  }
  if(!outer.maxPrice || parseInt(outer.maxPrice) < parseInt(inner.maxPrice)){
          outer.maxPrice = inner.maxPrice
  }
  return outer
};

var setRange = function(obj){
  if (parseInt(obj.minPrice) > parseInt(obj.maxPrice)){
    obj.range = "$" + obj.maxPrice + " - $" + obj.minPrice
  }
  else {
    obj.range = "$" + obj.minPrice + " - $" + obj.maxPrice
  }
  return obj
};
