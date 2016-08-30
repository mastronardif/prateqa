'use strict';
var util = require('util');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var session = require('client-sessions');
var miOptions;


module.exports.loadItem = function(req, res) {

console.log('module.exports.loadItem ');
  var entryId = req.params.entryId;
      
  req.db.collection('venueMenus').find({"menus.entries.items.entries.items.entryId": entryId})
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
      
      
    //console.log('Menu found! Name: ' + menu[0].name);
    //req.db.collection('venues').findOne({"name": menu[0].name}).then(function(venue){
    req.db.collection('venues').findOne({"name": menu[0].name}).then(function(venue){
      
    //console.log('Venue found! Name: ' + venue.name);
    var item = findItem(menu[0], entryId);
    //console.log('Item found! Name: ' + item.name);
    //var tree = createFancyTreeMenu(menu[0]);
    var tree = createFancyTreeMenu(menu[0]);
    //console.log('tree = ', tree);
    
    //this is an object created to represent the information that was querid from the db about the menu
    miOptions = {        
       options: ["Yes", "No","Can Request?"],
       selectValue: ["Yes", "Yes", "Can Request?", "Yes", "No", "Can Request?","Yes", "No", "Can Request?", "Yes", "No", "Can Request?", "Yes", "No", "Can Request?"] //"Insomnia Cookies"    
   };
    
    var sliders = [10,20,30,40,50,60,70,80];
    res.render('menuItems/new', {
        venue: venue, 
        item: item,
        tree: tree,
        sliders: sliders,
        miOptions: miOptions
      });
    });
  });
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
  //console.log('findItem ', menu, entryId); 
  //menu[0].menus.forEach(function (menu){
  menu.menus.forEach(function (menu22){
      //console.log('menu22 ', menu22);
    menu22.entries.items.forEach(function(item){
      item.entries.items.forEach(function(item22){
        if (item22.entryId === entryId){
          foundItem = item22;
          console.log('item22 ', item22);
        }
      })
    })
  })
  
  //console.log('foundItem ', foundItem);
  return foundItem
}

var createFancyTreeMenu = function(data){
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