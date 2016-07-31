'use strict';
var util = require('util');
var session = require('client-sessions');
//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost:27017/platerate';
var assert = require('assert');
//var db;

// Initialize connection once
/* MongoClient.connect(url, function(err, database) {
  if(err) throw err;
  console.log("Connected correctly to server.");
  db = database;
}); */

module.exports.editProfile = function(req, res) {
  var diet = req.body.diet;
  var selectedDiets = [];
  if(diet === undefined){
    console.log("No dietary preferences selected!");
  }
  else{
    for(var i=0; i<diet.length;i++){
      selectedDiets.push(diet[i]);
    }
    console.log("These are selected:"+ selectedDiets);
  }
  var email = req.body.email;
  console.log("Here is the email:" + email);
  var updatedProfile = req.body;
  req.db.collection('profile').updateOne(
    {"email": email},
      { $set:
        {
          "Street": updatedProfile.street,
          "City": updatedProfile.city,
          "PostalCode": updatedProfile.postal,
          "Country": updatedProfile.country,
          "Phone": updatedProfile.phone,
          "Birthday": updatedProfile.datepicker,
          "GuruTasterProfile":
             {
                "Sweet": updatedProfile.sweet,
                "Salty": updatedProfile.salty,
                "Savory": updatedProfile.savory,
                "Bitter": updatedProfile.bitter,
                "Sour": updatedProfile.sour,
                "Spicy": updatedProfile.spicy,
                "Presentation": updatedProfile.presentation,
                "Quantity": updatedProfile.quantity,
                "ServiceRating": updatedProfile.service_rating,
                "ClassyAmbience": updatedProfile.classy_ambience,
                "NoiseLevel": updatedProfile.noise_level,
                "ValueForPricing": updatedProfile.value_for_price
             },
             "DietaryPreferences": selectedDiets
         }
      }, //set
      {
        upsert: false //do not create a doc if the id doesn't exist
      }
    ); //updateOne
  res.redirect('/basicsearch');
};

module.exports.loadProfile = function(req,res) {
  // sets a cookie with the user's info
  console.log(".loadProfile for " + req.user);
  req.session.user = req.user;
  req.db.collection('profile').findOne({'href': req.user.href})
    .then(function (found){
    if(!found) {
    	req.db.collection('profile').insertOne(req.user);
			res.render('basicsearch/new');
      return;
    }
    else {
      /*
      create an array of objects to hold the fields of the objectfound
      from the query
      In contact_info_form.ejs, add value to the input fields to
      accept the respective inputs when the array is passed in render by
      using the <% userInfo %> to input the values in the form.
      */
      if(found.Street == null){
        var userInfo = [
          { street: "" },
          { city: ""},
          { postalCode: "" },
          { country: "" },
          { phone: ""},
          { bday: "" },
          { tasteProfile: {
              Sweet: '40,60',
              Salty: '40,60',
              Savory: '40,60',
              Bitter: '40,60',
              Sour: '40,60',
              Spicy: '40,60',
              Presentation: '40,60',
              Quantity: '40,60',
              ServiceRating: '0',
              ClassyAmbience: '0',
              NoiseLevel: '40,60',
              ValueForPricing: '40,60'
            }
          },
          { dietaryPreferences: [] }
        ];
        res.render('profile/edit', {userInfo: userInfo});
        return;
      }
      else {
        var userInfo = [
          { street: found.Street       },
          { city: found.City           },
          { postalCode: found.PostalCode },
          { country: found.Country     },
          { phone: found.Phone         },
          { bday: found.Birthday       },
          { tasteProfile: found.GuruTasterProfile},
          { dietaryPreferences: found.DietaryPreferences}
        ];
        res.render('profile/edit', {userInfo: userInfo});
        return;
      }
    }
    }); //then
};
