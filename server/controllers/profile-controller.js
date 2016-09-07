'use strict';
var util = require('util');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var session = require('client-sessions');

module.exports.viewProfile = function (req, res) {
    res.render('profile/edit');
};

//for setting the values
module.exports.editProfile = function (req, res) {
    var diet = req.body.diet;
    var selectedDiets = [];
    if (diet === undefined) {
        console.log("No dietary preferences selected!");
    }
    else {
        for (var i = 0; i < diet.length; i++) {
            selectedDiets.push(diet[i]);
        }
        console.log("These are selected:" + selectedDiets);
    }
    console.log("this is the req.body.user ");
    var email = req.body.email;
    var theBody = req.body.firstname;
    console.log("Here is the req.firstname");
    console.log("req.body = " + JSON.stringify(req.body) );
    var updatedProfile = req.body;
    req.db.collection('profile').updateOne(
        {"email": email},
        {
            $set: {
                "firstname": updatedProfile.firstname,
                "lastname": updatedProfile.lastname,
                "Street": updatedProfile.street,
                "City": updatedProfile.city,
                "PostalCode": updatedProfile.postal,
                "Country": updatedProfile.country,
                "Phone": updatedProfile.phone,
                "Birthday": updatedProfile.datepicker,
                "GuruTasterProfile": {
                    "Sweet": updatedProfile.sweet,
                    "Salty": updatedProfile.salty,
                    "Savory": updatedProfile.savory,
                    "Bitter": updatedProfile.bitter,
                    "Sour": updatedProfile.sour,
                    "Spicy": updatedProfile.spicy,
                    "Presentation": updatedProfile.presentation,
                    "Quantity": updatedProfile.quantity,
                    "NoiseLevel": updatedProfile.noise_level,
                    "ValueForPricing": updatedProfile.value_for_price,
                    "ServiceRating": updatedProfile.service_rating,
                    "ClassyAmbience": updatedProfile.classy_ambience
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

//checks if the user exist if
module.exports.loadProfile = function(req,res) {
  //sets a cookie with the user's info
  //console.log("loadProfile, req = ", JSON.stringify(req));
  console.log("\nloadProfile, req.user.customData = \n", req.user.customData);   
  console.log("\nloadProfile, req.user.customData = \n", req.user.customData.ReferralId); 
  //console.log("\nloadProfile, req.user.customData = \n", JSON.stringify(req.user.customData));
  console.log("\nloadProfile, req.user = ", JSON.stringify(req.user));
  req.session.user = req.user;
  req.db.collection('profile').findOne({'href': req.user.href})
    .then(function (found){
    if(!found) {
        console.log("\n insertOne begin\n");
        console.log("\n\t customData \n" + req.user.customData);
        console.log("\n insertOne end\n");
        
    	req.db.collection('profile').insertOne(req.user);
			res.render('basicsearch/new', {account:req.user});
      return;
    }
    else {
      /*
        for when the user edits their name, this will change it in
        in the database and in their profile
      */
      if(found.firstname != null && found.found != null) {
        req.user.givenName = found.firstname;
        req.user.surname   = found.lastname;
      }
      /*
      create an array of objects to hold the fields of the objectfound
      from the query
      In contact_info_form.ejs, add value to the input fields to
      accept the respective inputs when the array is passed in render by
      using the <% userInfo %> to input the values in the form.
      */
      if(found.Street == null     ||
         found.City == null       ||
         found.PostalCode == null ||
         found.Country == null    ||
         found.Phone == null      ||
         found.Birthday == null){
        
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
              NoiseLevel: '40,60',
              ValueForPricing: '40,60',
              ServiceRating: '40,60',
              ClassyAmbience: '40,60'
            }
          },
          { dietaryPreferences: [] }
        ];
        res.render('profile/edit', {userInfo: userInfo});
        return;
      }
      else {

        req.user.givenName = found.firstname;
        req.user.surname   = found.lastname;
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
