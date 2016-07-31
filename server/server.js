'use strict';
var express = require('express');
var path = require('path');
var bodyp = require('body-parser');
//var promise = require('bluebird');
var stormpath = require('express-stormpath');
var app = express();
var session = require('client-sessions');
var MongoClient = require('mongodb').MongoClient;
//the controller(s)
var profileController = require('./controllers/profile-controller');
var searchController  = require('./controllers/search-controller');
var ratingsController = require('./controllers/ratings-controller');
var ssController      = require('./controllers/socialshare-controller');
var pingController    = require('./controllers/ping-controller');

//var searchController = require('./controllers/search-controller');

app.use(express.static('./public'));
app.use(bodyp.urlencoded({ extended: false }));
//mongodb://admin:admin@ds057254.mongolab.com:57254/rdicode
//mongodb://admin:admin@ds057254.mongolab.com:57254/platerate
var dev_connection_string = 'mongodb://localhost:27017/platerate';
var connection_string =  process.env.DB_PR || dev_connection_string;
// TEST print env vars.
console.log("connection_string = " + connection_string);
var spID = process.env.STORMPATH_CLIENT_APIKEY_ID;
var spCLIENT_APIKEY_SECRET =  process.env.STORMPATH_CLIENT_APIKEY_SECRET;
//console.log("connection_string = " + process.env.STORMPATH_APPLICATION_HREF);

var db;
// Initialize connection once
MongoClient.connect(connection_string, function(err, database) {
  if(err) throw err;
  console.log("ROOT: Connected correctly to server.");
  db = database;
});

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    req.myParisite = {'left':'right'};
    
    next();
});

app.use(stormpath.init(app, {
  // web: {
  //   logout: {
  //     enabled: true,
  //     uri: '/logmeout',
  //   }
  // },
  apiKey: {
      id: spID, //'4QC8YU9UJ574T282I956WBWP4',
      secret: spCLIENT_APIKEY_SECRET, //'+Pcmi6Lvlr/nEsjDD3zkAfFDSM0COcAnAsVX9lA1k88',
      resave: true
  },
  postLoginHandler: function(account, req, res, next) {
      console.log('User ' + account.email + ' just logged in!');
      next();
  },
  postLogoutHandler: function(account, req, res, next) {
      console.log('User ' + account.email + ' just logged out!');
      next();
  }
}));
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  httpOnly: true,
  secure: true,
  ephemeral: true,
  resave: false ,
  savaUninitialized: true
}));

app.set('trust proxy', true);
app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, './views'));
console.log('__dirname = ' , __dirname);

app.get('/profile', function(req, res) {
    res.render('profile/index');
});
app.get('/profile/edit', function(req, res) {
    res.render('profile/edit');
});

//app.all ('/ping',stormpath.loginRequired, pingController.ping);console.log(req.query);
// for testing.!!!
app.all ('/ping', bodyp.json(), pingController.ping);

app.get('/',stormpath.loginRequired, profileController.loadProfile);
app.post('/profile/update', profileController.editProfile);
// app.get('/logout', function(req, res) {
//   req.session.reset();
//   console.log("it is loggin out manually!");
//   res.redirect('/basicsearch');
// });

app.get('/ratings/new', stormpath.loginRequired, ratingsController.newRatings);


//added this radesh
app.get('/profile', stormpath.loginRequired, function(req, res) {
    res.render('/profile/edit');
});

// Loading Basic_Search_page/Home_page
app.get('/basicsearch', searchController.showForm);

//search for menu items
app.post('/basicsearch/submit', searchController.searchMenuItems);

//rate
app.post('/submitRestaurant/:restaurantId', stormpath.loginRequired, ratingsController.rateVenues);
app.post('/submitItem/:foodId', stormpath.loginRequired, ratingsController.rateItems); //ratingsController.rateItems);

//Loading SocialShare page
app.get('/socialshare', stormpath.loginRequired, function (req, res){
  res.render('socialshare/new')
});

//socialshare/send
app.post('/socialshare/send',  ssController.sendemail);

/**
 * Start the web server.
 */
app.on('stormpath.ready',function () {
  console.log('Stormpath Ready');
  var port = process.env.PORT || 1337;
  app.listen(port, function () {
    console.log('Application running at http://localhost:'+port);
  });
});


// //Listening on Port 1337
// app.listen(1337, function(req,res){
  // console.log("Listening on Port 1337...");
// });

// //stormpath will let you know when it's ready to start aunthenticating users
// app.on('stormpath.ready', function() {
  // console.log('Stormpath Ready!');
// });
