"use strict";
var fs = require("fs");
var request = require("request");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;
var mongo = {
  find: function() {
    console.error("Not the right find");
  }
};

// Decimal degrees and Plus/minus—Latitude and longitude coordinates are represented as decimal numbers. 
// The latitude is preceded by a minus sign ( – ) if it is south of the equator (a positive number implies north), 
// and the longitude is preceded by a minus sign if it is west of the prime meridian 
// (a positive number implies east); for example, 37.68455° –97.34110°.
// Latitude measurements range from 0° to (+/–)90°.
//  Longitude measurements range from 0° to (+/–)180°.

if (process.argv.length < 4) {
    console.log("Usage: " + __filename + " latitude, longitude");
    process.exit(-1);
}
 
var latitude =  process.argv[2];
var longitude = process.argv[3];

if (90 < Math.abs(latitude)) {
  console.log("latitude out of range")
  process.exit(-1);
} 

if (180 < Math.abs(longitude)) {
    console.log("longitude out of range")  
    process.exit(-1);
}


console.log("latitude: " + latitude);
console.log("longitude: " + longitude);


// thirty days ago
var oldThirty = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 30);




// MongoClient.connect("mongodb://test123:test123@ds053688.mongolab.com:53688/heroku_app32366298", function(err, db) {

MongoClient.connect("mongodb://localhost:27017/platerate", function(err, db) {
    if(err == null && db!=null) {
    mongo = db.collection("venues");
    doScrape(db);
  } else {
    throw("Didn't connect to mongo");
  }
});



function join(obj, sep) {
  var result = "";
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      if (result.length != 0) result += sep;
      result += attr + "=" + obj[attr];
    }
  }
  return result;
}

function doScrape(db) {
  console.log("starting doScrape");
  // request.debug=true;


  var util = require("util");

  var commonParams = {
    client_id : "5GYLC30XGL2N2BUGP5MUQLE0M40XI32TIYNDGPGOFESLOP3D",
    client_secret: "ISLE2CKXBYCGUO4FRN0B2WKKGZ2GXLRO04U4KMRCZTDWNEPA",
    v: "20160101"
  };
  var venueQueryParams = {
    // ll: "40.783843,-73.977828",
    ll: latitude + "," + longitude,
    radius: 160,
    limit: 50,
    intent: "browse",
    categoryId: "4d4b7105d754a06374d81259"    // "Food", see 4sq_api_results/veueSearchFood.json
    //section: "food"
  };

  console.log("ll: " + venueQueryParams.ll);
  // process.exit(0);

  var venueQueryString = "search?" + join(venueQueryParams, "&") + "&" + join(commonParams, "&");

  var venueReqOpts = {
    //url: "https://api.foursquare.com/v2/venues/explore?ll=40.7236447,-74.0050674&client_id=5GYLC30XGL2N2BUGP5MUQLE0M40XI32TIYNDGPGOFESLOP3D&client_secret=ISLE2CKXBYCGUO4FRN0B2WKKGZ2GXLRO04U4KMRCZTDWNEPA&section=food&v=20160101&m=foursquare",
    url: "https://api.foursquare.com/v2/venues/" + venueQueryString,
    method: "GET"
  };
  var menuReqOpts = {
    urlPrefix: "https://api.foursquare.com/v2/venues/",
    urlSuffix: "/menu/?" + join(commonParams, "&"),
    method: "GET"
  };
  var count = 0;

  // console.log("at line 107");

  function processVenueResp(error, response, body) {
    console.log("starting processVenueResp");
    if (!error && response.statusCode == 200) {
      decodeVenueResponse(body);
      eachVenueMenu();
    } else {
      console.log("error in processVenueResp");
      // console.error(util.inspect(response, false, null));
    }
    console.log("finished processVenueResp");
  }


  // console.log("at line 120");
  function decodeVenueResponse(json) {
    console.log("starting decodeVenueResponse");

    var data = JSON.parse(json).response;
    var venues = data.venues;
    var venues_buf = "";

    if (!venues) {
      console.log("No venues");
      return;
    }
    for(var venueIndex=0; venueIndex < venues.length; ++venueIndex) {
        var venue = venues[venueIndex];
        venue._id = venue.id;
        // venue["order"] = (1 + venueIndex).toString(10);
        delete venue.id;
        // console.log(venueIndex, venue.name);
        venues_buf += JSON.stringify(venue) + "\n";
        mongo.insert(venue);
        //console.log(util.inspect(mongo.insert(venue)));
      }

      //  we're writing a file that can be used for mongoimport
      //  mongoimport --db platerate --collection venues --file menus/venus.json

      fs.writeFile("menus/venus.json", venues_buf, function(err) {
        if(err) {
          console.log("Error from writeFile venus.json")
          console.log(err);
          return;
        }
        console.log("The venus.json file was saved!");
      });

    
    
    console.log("finished decodeVenueResponse")
    
       }


  function eachVenueMenu(){
      console.log("starting eachVenueMenu");
      mongo.find(
        {$or: [{"menu_date" : { $exists: false }}, {"menu_date" : { $lte: oldThirty }} ]},
        { _id: 1, name: 1}, function (err, resultCursor) {

              function processItem(err, item) {
                console.log("in here");
                console.dir(item);
                if (item === null) {  
                  console.log("ALL DONE");  // not really, mongodb writes still happening
                  // db.close();
                  return;   // all done
                } 
                
                reqVenueMenu(item, function(err) {
                    console.log("calling again")
                    resultCursor.nextObject(processItem);
                });

              };


              // myVenues.forEach(reqVenueMenu);
              console.log("call once")
              resultCursor.nextObject(processItem);


      // console.log(mongo.find());
    });

    };

  function reqVenueMenu(venue, callback) {

    if (!venue) {
      console.log("no venue");
      // db.close();
      return;
    }

    if (!venue._id || !venue.name) {
        console.log("missing venue._id or venue.name");
        console.error(util.inspect(response, false, null));
        return callback();
        }

    console.log("starting reqVenueMenu for " + venue.name);
    var menuQueryString = menuReqOpts.urlPrefix + venue._id + menuReqOpts.urlSuffix;
    console.log(menuQueryString);
    request.get(menuQueryString, function(error, response, json) {

      var data; var menu_row;

      if (error) {
        console.log("got error at get menuQueryString");
        return callback();
      }
      if (response.statusCode !== 200) {
        console.log("statusCode of " + response.statusCode + " not 200 at get menuQueryString");
        return callback();
      }
      
      data = JSON.parse(json).response;
      if (!data.menu || !data.menu.menus || !data.menu.menus.items) {
        console.log("couldn't get menus from JSON.parse for " + venue.name);
        console.dir(data);
        return; // return callback();
        }

      menu_row = {
        fourSquareId : venue._id,
        name : venue.name,
        menus : data.menu.menus.items
        }
      var fn = "menus/" + venue.name.trim().split(/\\\/:/).join("_") + ".json";
      fs.writeFile(fn, JSON.stringify(menu_row), function(err) {
        if (err)  {
          console.log("err on writefile. fn: " + fn);
          console.log(err);
          return callback();
          }

        console.log("The " + fn + " file was saved!");
        var mongo2 = db.collection("venueMenus");
        console.log(venue.name);
        mongo2.insert(menu_row, function(err, r) {
           if (err) console.log("error on mongo2.insert");
         });
        mongo.updateOne({"_id": venue._id}, {$set: {"menu_date": new Date()} }, function(err, r) {
           if (err) console.log("error on mongo menu_date setting");
         });


      });

      });
    console.log("finished reqVenueMenu for " + venue.name)
    return callback();
}


  if(process.env.FROM_DISK) {
    fs.readFile("json.txt", "utf8", function (err,json) {
      if (err) {
        console.log(err);
      }
      decodeVenueResponse(json);

      console.log(mongo.find());
    });
  }
  else {
    console.log("scraping");
    request.get(venueReqOpts.url, processVenueResp);
  }

console.log("end of doScrape")
}
