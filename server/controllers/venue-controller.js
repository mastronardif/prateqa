'use strict';
var util = require('util');
var request = require("request");
var Venue = require('./myvenue');
var TEST  = require('../../scrape0a');

//var session = require('client-sessions');
var assert = require('assert');

module.exports.loadItemWithNoDB = function (req, res) {
    console.log('module.exports.loadItemWithNoDB ');
    //console.log(req);
    console.log(req.query);
    console.log(JSON.stringify(req.body) );
    
    var resluts = {
                    venue: "", 
                    item: "",
                    tree: "",
                    sliders: "",
                    miOptions: ""
                  };
    
    
    var entryId = req.body.entryId;
     console.log('\n\t\t **** entryId = ' + entryId); 
    // // FM 9/8/16 begin
    var venue;
    var item;
    var tree;
    var sliders = "wtf";
    var miOptions;
    
    // load menu from foursquare.
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
            console.log(menu); //return;
            
            var mmenus = [menu[2].response.menu.menus.items[0]];            
            //var tree = createFancyTreeMenu(menu[0]);
            var tree = mmenus;

            res.json({
                venue: venue, 
                item: item,
                tree: tree,
                sliders: sliders,
                miOptions: miOptions
            });
      
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
            console.log(menu); //return;
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

//print out error messages
function printError(error){
  console.error(error.message);
};

