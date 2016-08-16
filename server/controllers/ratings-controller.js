'use strict';
var util = require('util');
var assert = require('assert');

module.exports.newRatings = function(req, res) {
    res.render('rating/new', {
        title: "Rate Your Experience",
        restaurant: { id: "res_fn3928agpa3up", name: "Gordon's Grotto" },
        foods: [
            { foodId: "99", foodName: "Halal" },
            { foodId: "00", foodName: "Sushi" }
        ]
    });
};

// module.exports.ratePlate = function(req, res) {
//   if(req.session){
//     db.collection('menuitems').insertOne(req.body);
//     res.redirect("/basicsearch");
//   }
//   else{
//     res.redirect("/login");
//   }

    // console.log("\t *** req.params.id = "+ req.params.id);
    // console.log(req.query);
    // console.log(JSON.stringify(req.body) );
    // var results = {'body':req.body}; //{'query': req.query, 'body':req.body};
    //
    // var someHTML = "<h1>You did it. <br/><i>Thanks for rating.</i> </h1>";
    // someHTML += '<br/><span style="color:green; word-wrap: break-word;">' + JSON.stringify(results) + "</span>";
    // res.end(someHTML);
//}


module.exports.rateVenues = function(req,res){
  var rid = req.params.restaurantId;
  var href = req.user.href;
  var updatedReview = req.body;
    req.db.collection('ratings').updateOne(
      {"BussinessId": rid},
      { $set:
        {
          "UserId": href,
          "BussinessId": updatedReview.RestaurantId,
          "BussinessName": updatedReview.RestaurantName,
          "YelpRating": updatedReview.YelpRating,
          "RestaurantRating": updatedReview.restaurantid_rating,
          "RestaurantReview": updatedReview.restaurantid_review,
          "ServiceRating": updatedReview.restaurantid_service,
          "AmbienceRating": updatedReview.restaurantid_ambience,
          "Cleaniness": updatedReview.restaurantid_cleanliness,
          "NoiseLevelRating": updatedReview.restaurantid_noise
         }
      }, //set
      {
        upsert: true //create a doc if the id doesn't exist
      }
    ); //RestaurantUpdateOne
  res.redirect("/ratings/new");
};

module.exports.rateItems = function(req,res){
  var fid = req.params.foodId;
  console.log(fid);
  var href = req.user.href;
  var updatedReview = req.body;
  req.db.collection('menuitems').updateOne(
    {"ItemId": fid},
    { $set:
      {
        //"BussinessId": updatedReview.RestaurantId, // null for now
        "UserId": href,
        "ItemId": updatedReview.ItemId,
        "ItemName": updatedReview.ItemName,
        "Stars": updatedReview.StarRating,
        "Price": updatedReview.ItemPrice,
        "Description": updatedReview.ItemReview,
        "ValueForPrice": updatedReview.ValueForPrice,
        "ItemPeppers": updatedReview.ItemPeppers,
        "ExpertReview": {
          "Sweet": updatedReview.sweet,
          "Salty": updatedReview.salty,
          "Savory": updatedReview.savory,
          "Bitter": updatedReview.bitter,
          "Sour": updatedReview.sour,
          "Spicy": updatedReview.spicy,
          "Presentation": updatedReview.presentaion,
          "Healthy": updatedReview.healthy,
          "Quantity": updatedReview.quantity
        }

      }
    }, //set
    {
      upsert: true //create a doc if the id doesn't exist
    }
  ); //MenuItemUpdateOne
  res.redirect("/basicsearch");
};
