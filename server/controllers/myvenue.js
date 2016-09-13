// myvenue.js
"use strict";
var request = require("request");
var Config  = require('../../configvenue.json');
   
    var Venue = function () {};
    
    Venue.prototype.log = function () {
        console.log('myvenu!');
    };
    
    
    Venue.prototype.getVenue = function (qry, cb) {
        console.log("\tfunction getVenueMenu(", qry, ', cb', ")");

        var callback = (typeof cb === 'function') ? cb : function() {};

        var id = qry.id;
        var url = Config.urlVenue;
        url = url.replace(/{.*:?}/i,  id);
        
        var options = { method: 'GET',
        url: url,
        qs: 
        { 
            client_id: Config.client_id,
            client_secret: Config.client_secret,
            v: Config.v},
            headers: 
        { 
        'cache-control': 'no-cache' } };

        request(options, function (error, res, body) {        
            if (error) return error; 
            console.log(JSON.parse(body).meta.code);
            console.log("\n***\n"+JSON.stringify(res.headers));
            
            if (res.statusCode == 400) {
                cb(null, res);
                return; 
            }

            var obj = JSON.parse(body);
            //console.log(JSON.stringify(obj) );
            console.log("id = " + id);

            cb(error, obj); //srcID);
        });
    }
 
 
    Venue.prototype.listMenu = function (qry, cb) {
        console.log('Venue.prototype.listMenu ' + JSON.stringify(qry) );
        var callback = (typeof cb === 'function') ? cb : function() {};
        var aResults = [JSON.stringify(qry), " "];// [{"left":"right"}];
        
        //getVenueMenu(menuIds[iNdex], cbNext);
        //srcID.id; qry.
        //4b1c3c13f964a520cb0424e3 4b4ba4faf964a520b7a226e3
        var venue = {id: qry.venueid, desc: "bob rest stop!"};
        //getVenueMenu(menuIds[iNdex], cbNext);
        //getVenueMenu(venue, callback);
        getVenueMenu(venue, function (err, data){
            if (err) {
                callback(err, data);
                return;
            }
            //console.log("data RESULTS = " + JSON.stringify(data) );
            aResults.push(data);
            callback(null, aResults);           
        } );
    }
    
    var app_user_ck_lat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
    var app_user_ck_lon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
    Venue.prototype.HelperIsValidLatLong = function (lat, lon) {
        var validLat = app_user_ck_lat.test(lat);
        var validLon = app_user_ck_lon.test(lon);
        if(validLat && validLon) {
            return true;
        } else {
            return false;
        }      
    }
    
    Venue.prototype.GetLatLongFromAddress = function (qry, cb) {
        var callback = (typeof cb === 'function') ? cb : function() {};
        var address = (qry.address) ? qry.address : "";
        //http://maps.googleapis.com/maps/api/geocode/json?address='311 lenox Ave Westfield, NJ 07090'
        var options = { method: 'GET',
        url: Config.urlGooglepiLatLong,
        qs: { address: address },
            headers: 
            { 'cache-control': 'no-cache' } };
        
        request(options, function (error, response, body) {
            if (error) return error;
            
            //console.log(JSON.stringify(response) );
            var res = JSON.parse(body);
            //console.log(res.results[0].formatted_address);
            
            //console.log(JSON.stringify(res.results[0].formatted_address));
            //console.log(JSON.stringify(res.results[0].geometry.location));
            var results = {"address": res.results[0].formatted_address, 
                           "loc":     res.results[0].geometry.location};
            //var obj = JSON.parse(response.body.results);
            //var aResults = obj.results.status;
            callback(null, {results: results});
        }); 
            
    }
    
    Venue.prototype.list = function (qry, cb) {
        var callback = (typeof cb === 'function') ? cb : function() {};
        // Minimum vitals
        var ll = qry.lat + ',' + qry.lon;
        var radius = (qry.radius) ? qry.radius : 160;
        console.log('list for '+ JSON.stringify(qry) );
        //console.log(radius);

        var options = { method: 'GET',
        url: Config.urlVenuesExplore,
        qs: { ll: ll,
            radius: radius,
            client_id: Config.client_id,
            client_secret: Config.client_secret,
            section: 'food',
            v: Config.v,
            m: 'foursquare' },
            headers: 
            { 'cache-control': 'no-cache' } };
            
        request(options, function (error, response, body) {
            if (error) return error;
            
            var obj = JSON.parse(body);
            var aResults = parseVenueResults(JSON.stringify(qry), JSON.parse(body));
            callback(null, aResults);
        });                
    }
 
    // var ff = new Venue();
    // Venue.prototype.fu = function () {(new Venue()).log();}    
    // function fu(){console.log('fff');}  
    
    Venue.prototype.cleanupForHasMenu = function (adata) {
        var header = adata[0];
        var aRetval;

        aRetval = adata.slice(1).filter(function(val){
            return ( (val.indexOf('[hasMenu]')) != -1) ;
        });        
        
        aRetval.unshift(header);
        return aRetval;
    }
    

    // Away to do it if you want a sequence.
    var menuIds = []; // make this a closure or something.
    var limit  = menuIds.length;
    var iNdex=0
    Venue.prototype.getMenusFrom = function(adata) {
         
        //bobo(menuIds[iNdex], cbNext); 
        // Foreach
        var aVenues = [];
        for (let ii = 0, len = adata.length; ii < len; ii++) {
            var myRe = /(.*)\[hasMenu\](.*)/g;
            var myArray = myRe.exec(adata[ii]);
            //console.log(myArray && myArray.length);
            
            if (myArray && myArray.length) {
                //console.log('124 \n' + myArray[1] + '\n' + myArray[2]);
                aVenues.push({"desc": myArray[1], "id": myArray[2]});
            }             
        }
        
        //console.log("aVenues = " + JSON.stringify(aVenues) );
        //aVenues.forEach(function (val){console.log(val.desc+" \t\t| "+val.id)});
        
        //cbNext(err, data)
        menuIds = aVenues;
        limit  = aVenues.length;
        iNdex=0
        //cbNext(null, 'data');
        getVenueMenu(menuIds[iNdex], cbNext);         
     }
     
     function cbNext(err, data) {
        console.log('\tcb(err, data)');
        iNdex++;
    
        if (err) { 
            console.log(err); //return; 
        }
        //else 
        {
            console.log("data = ", data, ", ", iNdex); 
            if (iNdex < limit) {                        
            getVenueMenu(menuIds[iNdex], cbNext);
            //cbNext(null, 'from');
            }        
        }
        //console.timeEnd('test');    
    }
    
    function parseVenueResults(qry, obj) {
        var aRetval = [qry];
        try {
        // console.log(obj.response);
        //console.log("groups.. = " + obj.response.groups[0].items[0].venue.name);
        for(var row = "", iii = 0, len = obj.response.groups[0].items.length; iii < len; iii++) {
            // console.log(+iii+1 + ')',                    
                        // ' ('+obj.response.groups[0].items[iii].venue.categories[0].shortName +')\t',
                        // obj.response.groups[0].items[iii].venue.name,                     
                        // obj.response.groups[0].items[iii].venue.location.address,
                        // ((obj.response.groups[0].items[iii].venue.hasMenu) ? '[hasMenu]':'-'),
                        // obj.response.groups[0].items[iii].venue.id,
                        // ""        
            // );    

            // rows
            row = iii+1 + ')'
                  +' ('+obj.response.groups[0].items[iii].venue.categories[0].shortName +')\t'
                  + obj.response.groups[0].items[iii].venue.name
                  + " " +obj.response.groups[0].items[iii].venue.location.address
                        // //obj.response.groups[0].items[iii].venue.hasMenu
                  + ((obj.response.groups[0].items[iii].venue.hasMenu) ? '[hasMenu]':'[-]')
                  + obj.response.groups[0].items[iii].venue.id
                  ;
                        //""        
            //) + 'zzz';             
            //console.log('row = '+row);
            aRetval.push(row);
        }
        } catch (err) {
            console.log('err = ', err);
            //return; // throw new Error(err); 
        }
        
        return aRetval;
    }
       
    
    function getVenueMenu(qry, cb) {
        console.log("\tfunction getVenueMenu(", qry, ', cb', ")");

        var callback = (typeof cb === 'function') ? cb : function() {};

        var id = qry.id;

        var url = Config.urlVenues + id + '/menu/';
        var options = { method: 'GET',
        url: url,
        qs: 
        { 
            client_id: Config.client_id,
            client_secret: Config.client_secret,
            v: Config.v},
            headers: 
        { 
        'cache-control': 'no-cache' } };

        request(options, function (error, res, body) {        
            if (error) return error; //throw new Error(error);
            console.log(JSON.parse(body).meta.code);
            console.log("\n***\n"+JSON.stringify(res.headers));
            
            if (res.statusCode == 400) {
                cb(null, res);
                return; 
            }
        
            var obj = JSON.parse(body);
            //console.log(JSON.stringify(obj) );
            console.log("id = " + id);

            var err = parseMenuResults(obj);

            cb(err, obj); //srcID);
        });
    }

    function parseMenuResults(obj) {
        console.log('\tfunction parseMenuResults(obj)' );
    try {
        console.log("\n\n *************** obj = \n");
        console.log(obj);
        var cntMenus = (obj.response.menu && obj.response.menu.menus) ? obj.response.menu.menus.length : 0;
        console.log("zzzz.. count = " + obj.response.menu.menus.count);
    
        console.log('item[0] len = ' +  obj.response.menu.menus.items.length);
        for(let iii = 0, len = obj.response.menu.menus.items.length; iii < len; iii++) {
            console.log(iii+1 + ')',                    
                    ' ('+obj.response.menu.menus.items[iii].name +')\t',                    
                    //obj.response.menu.menus.items.items[iii].venue.name,                     
                    //obj.response.groups[0].items[iii].venue.location.address,
                    //obj.response.groups[0].items[iii].venue.hasMenu,
                    //((obj.response.groups[0].items[iii].venue.hasMenu) ? '[hasMenu]':'-'),
                    //obj.response.groups[0].items[iii].venue.id,
                    ""        
        );
        
        // items[1]
        console.log('item[1] = ' +  obj.response.menu.menus.items[iii].name);
        //for(let jj = 0, len = obj.response.menu.menus.items[iii].entries.items.length; jj < len; jj++) {
        for(let jj = 0, len = obj.response.menu.menus.items[iii].entries.items.length; jj < len; jj++) {
            //console.log('len = ' + len + obj.response.menu.menus.items[jj].name);            
            console.log('   '+ iii + '-' +(jj +1) + ')',                    
                    //' ('+obj.response.menu.menus.items[jj].name +')\t',                    
                    //obj.response.menu.menus.items.items[iii].venue.name,                     
                    //obj.response.groups[0].items[iii].venue.location.address,
                    //obj.response.groups[0].items[iii].venue.hasMenu,
                    //((obj.response.groups[0].items[iii].venue.hasMenu) ? '[hasMenu]':'-'),
                    //obj.response.groups[0].items[iii].venue.id,
                    ""
            );
            
            // item[2]
            console.log('item[2] = ' +  obj.response.menu.menus.items[iii].entries.items[jj].name);
            // //console.log('item[2] = ' +  obj.response.menu.menus.items[iii].entries.items[].name);
            for(let kk = 0,   len = obj.response.menu.menus.items[iii].entries.items.length; kk < len; kk++) {
                //console.log('kk = ' + kk);            
                console.log('   '+ (iii+1) + '-' +(jj +1) + '-' + (kk +1)+ ')',                    
                     ' ('+ obj.response.menu.menus.items[iii].entries.items[kk].name +')\t',                    
                    // //obj.response.menu.menus.items.items[iii].venue.name,                     
                    // //obj.response.groups[0].items[iii].venue.location.address,
                    // //obj.response.groups[0].items[iii].venue.hasMenu,
                    // //((obj.response.groups[0].items[iii].venue.hasMenu) ? '[hasMenu]':'-'),
                    // //obj.response.groups[0].items[iii].venue.id,
                    ""
                );
                
                // item[3]
                //console.log('\t\t item[3]' + obj.response.menu.menus.items[iii].entries.items[jj].entries.items.length);
                for(let ll = 0,   len = obj.response.menu.menus.items[iii].entries.items[jj].entries.items.length; ll < len; ll++) {
                    //console.log('__ll = ' + ll);   
                    console.log('   '+ (iii+1) + '-' +(jj +1) + '-' + (kk +1)+ '-' + (ll+1) + ')',  
                    obj.response.menu.menus.items[iii].entries.items[jj].entries.items[ll].name, 
                                ''
                    );                    
                }
                 
            }
        
        }
    }
    
    } catch (err) {
        console.log('err = ', err);
        return err; // throw new Error(err); 
    }
    
    return null;
}
    
module.exports = new Venue();