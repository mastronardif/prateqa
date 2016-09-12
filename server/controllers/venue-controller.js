'use strict';
var util = require('util');
var request = require("request");
var Venue = require('./myvenue');
var TEST  = require('../../scrape0a');

//var session = require('client-sessions');
var assert = require('assert');

module.exports.loadItemWithNoDB = function (req, res, cb) {
    var callback = (typeof cb === 'function') ? cb : function() {};
    console.log('module.exports.loadItemWithNoDB ');
    //console.log(req);
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    
    //this is an object created to represent the information that was querid from the db about the menu
    var miOptions = {        
       options: ["Yes", "No","Can Request?"],
       selectValue: ["Yes", "Yes", "Can Request?", "Yes", "No", "Can Request?","Yes", "No", "Can Request?", "Yes", "No", "Can Request?", "Yes", "No", "Can Request?"] //"Insomnia Cookies"    
   };
   var sliders = [10,20,30,40,50,60,70,80];
    var results = {
                    venue: "", 
                    item: "",
                    tree: "",
                    sliders: sliders,
                    miOptions: miOptions
                  };
    
    
    var entryId = req.body.entryId;
     console.log('\n\t\t **** entryId = ' + entryId); 
     
    // load Venue from foursquare.    
    
    // load Menu from foursquare.
    var qq = {"venueid": req.body.venueid, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius, "venueName": req.body.venueName };
    var venueId = req.body.venueid;
    var venueName = req.body.venueName;
    var venue = {venueId: venueId, name: venueName, price: "9.99", location: {address: "tbd"},
                 url: "tbd", menu: {mobileUrl: "tbd", url: "tbd" }    
    };
    
    Venue.listMenu(qq, function cb(err, data) {
        console.log('\tcb(err, data)');
    
        if (err) { 
            console.log(err); //return; 
            callback(err, results);
        }
        else {
            //console.log("data = ", data.join('\n'));
            var jsonData = JSON.stringify(data);
            var javascriptObject = JSON.parse(jsonData); 
            var menu = javascriptObject;
            
            var mmenus = [menu[2].response.menu.menus.items[0]];       
            
            var item = findItem({menus: [menu[2].response.menu.menus.items[0]]}, entryId);      
            results.item = item;            
            results.venue = venue;
            var tree = createFancyTreeMenu({menus: [menu[2].response.menu.menus.items[0]]});

            results.tree = tree;
            
            console.log("\n callback \n");
            console.log(callback);
            callback(err, results);
        }  
    });
};

module.exports.listMenu_tofancytreeDB = function (req, res) {
    var qq = {"venueid": req.body.venueid, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius, "venueName": req.body.venueName };
    var venueId = req.body.venueid;
    var venueName = req.body.venueName;
    
    Venue.listMenu(qq, function cb(err, data) {
        console.log('\tcb(err, data)');
    
        if (err) { 
            console.log(err); //return; 
            res.json({}); 
        }
        else {
            //console.log("data = ", data.join('\n'));
            var jsonData = JSON.stringify(data);
            var javascriptObject = JSON.parse(jsonData); 
            var menu = javascriptObject;//.response.menu;
            var myCol = 'testMenu';
            //console.log(menu); //return;
            // write to DB.
            {
                req.db.collection(myCol).updateOne(
                {venueId: venueId},
                
                {
                    modifiedDate: new Date(),
                    venueId: venueId,
                    name: venueName,
                    fsq_menu: menu,
                    // make it fit the fancy tree for now.  
                    menus: [menu[2].response.menu.menus.items[0]] // menu[2].response.menu.menus.items[0]
                },               
                {
                    upsert: true
                }
                )
            }
            res.json(javascriptObject);
        }  
    });
};

module.exports.listMenu = function (req, res) {
    
    var qq = {"venueid": req.body.venueid, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius };
    var venuId = req.body.venueid;
    
    Venue.listMenu(qq, function cb(err, data) {
        console.log('\tcb(err, data)');
    
        if (err) { 
            console.log(err); //return; 
            res.json({}); 
        }
        else {
            //console.log("data = ", data.join('\n'));
            var jsonData = JSON.stringify(data);
            var javascriptObject = JSON.parse(jsonData);        
            res.json(javascriptObject);
        }  
    });
};

module.exports.list = function (req, res) {
//console.log('XXXXX'+JSON.stringify(req.body) );
 //console.log(req.body.lat);
    //var idd = 'wtf'; //req.params.id;
    //{"lat":"119SSSS898","lon":"229SSSS898","radius":"160"}
    var qq = {"lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius };
    Venue.list(qq, function cb(err, data) {
    console.log('\tcb(err, data)');
    
    if (err) { 
        console.log(err); //return; 
        res.json({}); 
    }
    else {
        console.log("data = ", data.join('\n'));
        //console.log("data = ", JSON.stringify(data));
        //console.log("data = \n", data);
        //res.json(JSON.stringify(data));
        var jsonData = JSON.stringify(data);
        var javascriptObject = JSON.parse(jsonData);        
        res.json(javascriptObject);
    }  
    //console.timeEnd('test');
});

    // if(req.params.id === undefined ||  req.params.id == 0) {
        // res.json({"message" : "You must pass ID other than 0"});   
        // return;    
    // }
    //var wtf = require('../../venues.json');
    //console.log(wtf);
    //res.json(wtf); 
    
    //res.json({"id" : idd});   
  //res.send('<h1 style="color:pink">Venues home page</h1>' + idd);
};


var findItem = function(menu, entryId){
  var foundItem;
  //console.log('findItem ', menu, entryId); 
  //console.log(menu);
  
  //menu[0].menus.forEach(function (menu){
  menu.menus.forEach(function (menu22){
      //console.log('menu22 ', menu22);
    menu22.entries.items.forEach(function(item){
      item.entries.items.forEach(function(item22){
        if (item22.entryId === entryId){
          foundItem = item22;
          //console.log('item22 ', item22);
        }
      })
    })
  })
  
  //console.log('foundItem ', foundItem);
  return foundItem
}

function createFancyTreeMenu (data){
    console.log("\n **** createFancyTreeMenu\n");
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


//print out error messages
function printError(error){
  console.error(error.message);
};

