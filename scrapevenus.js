"use strict";
var fs = require("fs");
var request = require("request");
var path = require('path');
var venue = require('./server/controllers/myvenue');
 //var configVenue = require('./configvenue');

// Decimal degrees and Plus/minus—Latitude and longitude coordinates are represented as decimal numbers. 
// The latitude is preceded by a minus sign ( – ) if it is south of the equator (a positive number implies north), 
// and the longitude is preceded by a minus sign if it is west of the prime meridian 
// (a positive number implies east); for example, 37.68455° –97.34110°.
// Latitude measurements range from 0° to (+/–)90°.
//  Longitude measurements range from 0° to (+/–)180°.

    var myParms = makeObj(process.argv.slice(2));
    console.log (process.argv);

    if (process.argv.length < 5) {
        // node scrapevenus.js lat 40.652315 lon -74.344705 radius 460 and items
        //node scrapevenus.js lat 41.290094 lon -73.920416 radius 460 and items
        console.log ( "\nUsage:\n node " + path.basename(process.argv[1]) + " latitude, longitude");
        return;
    }
    
    console.log('venues for ');

    var qq = {"lat": myParms.lat, "lon": myParms.lon, "radius": myParms.radius };
    
    venue.list(qq, function cb(err, data) {
        console.log('\tcb(err, data)');
    
        if (err) { 
            console.log('err = '+ err); //return; 
        }
        else {
            console.log("data = \n", data.join('\n'));
            if (myParms.and && myParms.and == 'items') {
                console.log('dick chainine');
                var data2 = venue.cleanupForHasMenu(data);
                console.log("data2 = \n", data2.join('\n'));
            
                venue.getMenusFrom(data2);
            }
        }  
        //console.timeEnd('test');
    });

return;


function makeObj(argv) {
  var obj = {};
  if (!(argv.length % 2) )  {

    for (var i = 0; i < argv.length; i += 2) {
      obj[argv[i]] = argv[i + 1];
    }
  }
  
  return obj;
}
