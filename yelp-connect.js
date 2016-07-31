'use strict';
var Yelp = require('yelp');
var MongoClient = require('mongodb').MongoClient;
var yelpRestaurantDeals;


//Connect to current mongodb instance
MongoClient.connect("mongodb://localhost:27017/platerate", function(err, db) {
    if(!err && db) {
    yelpRestaurantDeals = db.collection('yelpdeals');
    console.log("Connected to mongodb and created connection");
  } else {
    throw("Didn't connect to mongo");
  }
});

//YELP API CREDENTIALS
var opts = {
  consumer_key: '4k5vgzmRyEvqbmi-knpaJg',
  consumer_secret: '-T3WOWWuuWgFCaDx6bTSv6gl5n8',
  token: 'iTJHR5J9AXaPvoC0JOQr_K5tpV7oi_B4',
  token_secret: 'fZngDh-RHqOd7xTorGuVG9MYrwo'
};

var yelp = new Yelp(opts);

function searchRestaurant(restaurantName, restaurantAddress, latitude, longitude) {
  /*
    Params:
      -restaurantName (required)
      -restaurantAddress (required)
      - latitude, longitude (optional)
    return: ""
  */
  var params = {
    term: restaurantName,
    location: restaurantAddress,
    deals: true, //limit results to restaurants that only have deals
    limit: 10, //set api results limit
    c11: latitude,longitude //longitude and latitude will provide a more exact result for the location of the searched term
    }

  yelp.search(params)
  .then(function(data) {
    for(var i = 0; i < data.businesses.length; i++){
      //double check if restaurant has deals
      if(data.businesses[i].deals){
        console.log("Found deals for:", data.businesses[0].id)
        getBusinessDeals(data.businesses[i].id, false);
      }
    }
  })
  .catch(function(error) {
    console.error("There was a problem searching restaurant:", error);
  });

}

function getBusinessDeals(businessId, saveDeals) {
  /*
    businessId(String): Yelp ID for business (required),
    saveDeals(Boolean): if true, values will be saved to the mongo collection
  */
  //For more info about response values check: https://www.yelp.com/developers/documentation/v2/business
  /* The business 'Deals' field contains the keys:
      - is_popular
      - what_you_get
      - time_start
      - title
      - url
      - additional_restrictions
      - options
      - important_restrictions
      - image_url
      - id
      - currency_code
  */
  yelp.business(businessId)
  .then(function(business){
    console.log("Searching deals for: ", businessId)
    if(saveDeals) {
      saveBusinessDeals(businessId, business.deals);
    }
    console.log(business.deals);
    return (business.deals) ? business.deals : "No deals found";
  })
  .catch(console.error);
}

function saveBusinessDeals(businessId, businessDeals) {
  console.log("Saving Deals for ", businessId);
  if ( yelpRestaurantDeals !== undefined ) {
    var deals = [];
    for(var i = 0; i < businessDeals.length; i++) {
      deals.push({
        deal_id: businessDeals[i].id
      });
    }

    try{
        var d = new Date()
        yelpRestaurantDeals.insert({
          business_id : businessId,
          business_deals: deals,
          date_updated: d.toDateString() + ' - ' + d.toLocaleTimeString()
        });
        console.log("inserted deals to collection");
      } catch(error) {
        console.error("Error writing business deals to collection ", error);
      }
      //console.log("Saved Deal id", businessDeals[i].id);
    } else {
      console.error("YelpDeals mongod collection was not created");
    }
}



//TESTS
//console.log(searchRestaurant('Williams & Bailey', '507 Grand St Brooklyn, NY 11211 '));
//console.log(searchRestaurant(' Homemade Taqueria', 'New York'));
console.log(getBusinessDeals('slide-bar-b-q-maspeth'));

module.exports.getBusinessDeals = getBusinessDeals;
module.exports.searchRestaurant = searchRestaurant;
