'use strict';
var util = require('util');
var request = require("request");
var venue = require('./myvenue');
//var session = require('client-sessions');
var assert = require('assert');


module.exports.listMenu = function (req, res) {
    
    var qq = {"venueid": req.body.venueid, "lat": req.body.lat, "lon": req.body.lon, "radius": req.body.radius };
    var venuId = req.body.venueid;
    
    venue.listMenu(qq, function cb(err, data) {
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
    venue.list(qq, function cb(err, data) {
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

