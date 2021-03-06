'use strict';
var util = require('util');
var request = require("request");
var Venue = require('./myvenue');
//var TEST  = require('../../scrape0a');
var _ = require('underscore');
var uuid = require('uuid');
var assert = require('assert');

module.exports.loadFromFsq = function (req, res, cb) {
    var callback = (typeof cb === 'function') ? cb : function() {};
    console.log('module.exports.loadFromFsq ');
    //console.log(req);
    console.log(req.query);
    //console.log(JSON.stringify(req.body) );
    
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
    
    //var item = findItem(menu[0], entryId);
    var entryId = req.body.entryId;
     console.log('\n\t\t **** entryId = ' + entryId); 
     
    // 1. load Venue from foursquare. 
    // "urlVenue": "https://api.foursquare.com/v2/venues/{VENUE_ID}", 
    var venueId = req.body.venueId;
    var qry = {id: venueId};
    console.log(" qry = " + qry);
    
    
    var venue = {venueId: venueId, name: "", location: {address: "tbd"},
                 url: "tbd", menu: {mobileUrl: "tbd", url: "tbd" }    
    };

    
    
    Venue.getVenue(qry, function cb(err, data) {
        console.log(" \n\n\t ***** ***** Venue.getVenue \n");
        console.log(" \n\n\t ***** ***** qry \n");
        console.log(qry);
        
        if (err) { 
    
            console.log(err); 
            callback(err, data);
            //res.json({}); 
            return; 
        }
        else {
             // console.log(data.response.venue.name);
             // console.log(data.response.venue.location.address);            
             // console.log(data.response.venue.url);
             // console.log(data.response.venue.menu.url);
             // console.log(data.response.venue.menu.mobileUrl);
             
             venue.name  = data.response.venue.name;             
             
             venue.location = {address: data.response.venue.location.address};
             venue.url            = data.response.venue.url;
             venue.menu.mobileUrl = data.response.venue.menu.mobileUrl;
             venue.menu.url       = data.response.venue.menu.url;
             
            //console.log("data = ", data.join('\n'));
            //var jsonData = JSON.stringify(data);
            //var javascriptObject = JSON.parse(jsonData);        
            //res.json(javascriptObject);
            
            //2.)
            /************************** begin ***************************************/
        // load Menu from foursquare.
        var qq = {"venueId": req.body.venueId, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius, "venueName": req.body.venueName };

    Venue.listMenu(qq, function cb(err, data) {
    
        if (err) { 
            console.log(err); //return; 
            callback(err, results);
            return;
        }
        else {
            //console.log("data = ", data.join('\n'));
            var jsonData = JSON.stringify(data);
            var javascriptObject = JSON.parse(jsonData); 
            var menu = javascriptObject;
                console.log("\n YYYYYYYYYYYYYYYYYY\n");
                //console.log(menu);
                
                //console.log("\n\n");
                //console.log(menu[2].obj.response.menu);
                //console.log("\n\n");
                //console.log(menu[2].obj.response.menu.menus);
                      
            //var item = findItem22(menu[2], entryId);
            var item = findItem22(menu[2].obj, entryId);      
            
            //var item = findItem({menus: [menu[2].response.menu.menus.items[0]]}, entryId);      
            //var item = findItem({menus: [menu[2].response.menu.menus.items]}, entryId);      
            results.item = item; 
            console.log("\n\n ********* item ***********\n");            
            console.log(entryId);
            //console.log(item);            
            console.log("\n\n ********* item ***********\n");            
            //venue.price = item.price;
            results.venue = venue;
            
            //var tree = createFancyTreeMenu({menus: [menu[2].response.menu.menus.items[0]]});
            //var tree22 = createFancyTreeMenu22(menu[2].response.menu.menus);
            var tree22 = createFancyTreeMenu22(menu[2].obj.response.menu.menus);
            console.log("\n\t ******** tree22\n");
            //console.log(tree22);
            
            results.tree = tree22;
            //results.tree = tree;
            
            callback(err, results);
            }  
            });
            /************************** End ***************************************/
        }  
    });
};

module.exports.listMenu_tofancytreeDB = function (req, res) {
    var qq = {"venueId": req.body.venueid, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius, "venueName": req.body.venueName };
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

module.exports.venueInfo = function (req, res) {
    var idd = req.params.id;
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    var qry = {id: idd};

    Venue.getVenue(qry, function cb(err, data) {
    
        if (err) { 
            console.log(err); //return; 
            res.json({}); 
        }
        else {
             res.json(data);
            //console.log("data = ", data.join('\n'));
            //var jsonData = JSON.stringify(data);
            //var javascriptObject = JSON.parse(jsonData);        
            //res.json(javascriptObject);
        }  
    });

};

module.exports.listMenu = function (req, res) {
    
    var qq = {"venueId": req.body.venueid, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius };
    var venuId = req.body.venueid;
    
    Venue.listMenu(qq, function cb(err, data) {   
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

module.exports.UpdateVenuesInDBbyLocation  = function (req, res) {
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    console.time('time_UpdateVenuesInDBbyLocation');
    // 1. get data from foursquare.
    var qq = {"address": req.body.address, "lat": req.body.lat, "lon": req.body.long, "radius": req.body.radius};
    //Venue.list(qq, function cb(err, data) {
    Venue.listDBobjs(qq, function cb(err, data) {    
        if (err) { 
            console.log(err); //return; 
            //res.json({}); 
            res.status(500).json({});
        }
        else {
            // 2. Save data.            
            // 2a. Save Venue data.          

            // write to DB.
            for (var iii = 1, len = data.length; iii < len; iii++) {
                //console.log(data[iii].id);                
                var vd = {
                    modifiedDate: new Date(),
                    venueId: data[iii].id,
                    venue: data[iii] 
                };                
                    
                //console.log("\n \t vd = \n");
                console.log(vd.venueId);
                //console.log(vd);
                
                req.db.collection("venues").updateOne(
                    {venueId: vd.venueId},                
                    vd,               
                    { upsert: true }
                );
            }
            
            // 2b. Save Plate / Menu data. 
            for (var jjj = 1, len = data.length; jjj < len; jjj++) { 
                if (!data[jjj].hasMenu) {
                    continue;   // skip no menu
                }
                console.log('\n', jjj + ") get menu for venueId: " +  data[jjj].id);
                var qry = {venueId: data[jjj].id, jjj: jjj, THEname: data[jjj].name, THEloc: data[jjj].location };
                //console.log("qry = " + JSON.stringify(qry) );
                
                Venue.listMenu(qry, function cb(err, data){
                    if (err) {
                        //console.log("\n\terr = \n"+ err);
                        var errObj = {err: err, mark: 123};                    
                        req.db.collection("venueMenus").updateOne(
                        {venueId: uuid.v1()},                
                            errObj,               
                        { upsert: true }
                    );                                             
                    }
                    else {
                     //console.log("\n \t ****** data begin *******");                    
                     //console.log(data); 
                        var mn = {
                        modifiedDate: new Date(),
                        venueId: data[0].venueId, //data.id,
                        name: data[0].THEname,
                        // extra data passed along.(the header info)
                        jjj: data[0].jjj,
                        location: data[0].THEloc,
                        
                        row0: data[0], 
                        row1: data[1], 
                        data: data,
                        menuitem: data[2].stacy.menuitem,
                        // old way.  before flattened(stacye) version begin
                        menus: data[2].obj.response.menu.menus.items,
                        // end
                        menu: data[2] 
                    };  

                    req.db.collection("venueMenus").updateOne(
                        {venueId: mn.venueId},                
                        mn,               
                        { upsert: true }
                    );                     
                     console.log("\n \t ****** data end   ********");                    
                    }
                    console.timeEnd('time_UpdateVenuesInDBbyLocation');
                });
            }           
            
            //console.log("data = ", data.join('\n'));
            //console.log("data = ", JSON.stringify(data));
            //console.log("data = \n", data);
            //res.json(JSON.stringify(data));
            //var jsonData = JSON.stringify(data);
            res.json(data);
        }  
    });
};

module.exports.list = function (req, res) {
    var qq = {"lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius };
    Venue.list(qq, function cb(err, data) {
        
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
    });
};

var findItem22 = function(menu, entryId){
    console.log('\n \t\t******* findItem22 \n'); 
 
    //console.log('findItem22 ', menu.menus.items.length, entryId); 
    //console.log(JSON.stringify(menu.response.menu) + "\n\n");  
    //console.log(menu.response.menu.menus);

    //menu.response.menu.menus.items.forEach(function(row) {
    for (var iii = 0, len = menu.response.menu.menus.items.length; iii < len; iii++) {
        //console.log('row iii ', menu.response.menu.menus.items[iii].name);  
        // //row.entries.items.forEach(function(row22) {
        for (var jjj = 0, len2 = menu.response.menu.menus.items[iii].entries.items.length;  jjj < len2; jjj++) {
            //console.log('\t row jjj ', menu.response.menu.menus.items[iii].entries.items[jjj].name);
            // //row22.entries.items.forEach(function(row33) {
            for (var kkk =0, len3 = menu.response.menu.menus.items[iii].entries.items[jjj].entries.items.length;  kkk < len3;  kkk++) {
                //console.log('\t\t row33 ', menu.response.menu.menus.items[iii].entries.items[jjj].entries.items[kkk].name);      
                if (menu.response.menu.menus.items[iii].entries.items[jjj].entries.items[kkk].entryId && 
                    menu.response.menu.menus.items[iii].entries.items[jjj].entries.items[kkk].entryId == entryId) {
                    //console.log(menu.response.menu.menus.items[iii].entries.items[jjj].entries.items[kkk]);
                    
                    return menu.response.menu.menus.items[iii].entries.items[jjj].entries.items[kkk];
                }
            }
        }
    }
    
    // not found.
    return {};
    
}

// var findItem = function(menu, entryId){
  // var foundItem;
  // //console.log('findItem ', menu, entryId); 
  // //console.log(menu);
  
  // //menu[0].menus.forEach(function (menu){
  // menu.menus.forEach(function (menu22){
      // //console.log('menu22 ', menu22);
    // menu22.entries.items.forEach(function(item){
      // item.entries.items.forEach(function(item22){
        // if (item22.entryId === entryId){
          // foundItem = item22;
          // //console.log('item22 ', item22);
        // }
      // })
    // })
  // })
  
  // //console.log('foundItem ', foundItem);
  // return foundItem
// }

function createFancyTreeMenu22 (data){
    console.log("\n **** createFancyTreeMenu22 \n");
    //console.log(data);
    //console.log("data.menus.length = " + data.menus[0].items.length);
    
    var tree = [];
    
    data.items.forEach(function(menu) {
        //console.log(menu);
        //console.log("\n _________________ \n");
        if (menu.entries.count > 0) {
            //console.log("\n",  menu.entries.count);
            
            var menuObj = {};
            menuObj.title = menu.name;
            menuObj.folder = true;
            menuObj.children = [];
            
            menu.entries.items.forEach(function(innerMenu) {
                //console.log(innerMenu.name);
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
        }
    });
    
    return JSON.stringify(tree);;
};

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

