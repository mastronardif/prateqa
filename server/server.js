'use strict';
var express     = require('express');
var path        = require('path');
var bodyp       = require('body-parser');
var stormpath   = require('express-stormpath');
var Fuse        = require('fuse.js');
var app         = express();
var session     = require('client-sessions');
var MongoClient = require('mongodb').MongoClient;

//the controller(s).

var profileController = require('./controllers/profile-controller');
var searchController  = require('./controllers/search-controller');
var ratingsController = require('./controllers/ratings-controller');
var ssController      = require('./controllers/socialshare-controller');
var pingController    = require('./controllers/ping-controller');
var menuItemController   = require('./controllers/menu-item-controller');
var advSearchController = require('./controllers/advSearch-controller');
var restaurantController    = require('./controllers/search-restaurant-controller');
var menuItemController = require('./controllers/menu-item-controller');

app.use(express.static('./public'));
app.use(bodyp.urlencoded({ extended: false }));

//mongodb://ling:ling@ds023694.mlab.com:23694/bubblevan
//mongo ds023694.mlab.com:23694/bubblevan
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
  if(err) { throw err; }

  console.log("ROOT: Connected correctly to server.");
  db = database;
});


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    req.myParisite = {'left':'right'};
    next();
});

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  httpOnly: true,
  secure: true,
  ephemeral: true,
  resave: false ,
  savaUninitialized: true
}));

app.post('/logout', function(req,res,next){
  req.session.user = null;
  next();
});

app.use(stormpath.init(app, {
  web: {
    logout: {
      enabled:true,
      nextUri:'/basicsearch'
    }
  },
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

app.set('trust proxy', true);

app.set('view engine','ejs');

app.get('/profile', function(req, res) {
    res.render('profile/index');
});

app.get('/profile/edit',stormpath.loginRequired,profileController.viewProfile);

// for testing.!!!
app.all ('/ping', bodyp.json(), pingController.ping);
//app.all ('/ping',stormpath.loginRequired, pingController.ping);console.log(req.query);

app.get('/',stormpath.loginRequired,profileController.loadProfile);

app.post('/profile/update',profileController.editProfile);

app.get('/ratings/new',stormpath.loginRequired, ratingsController.newRatings);

// Loading Basic_Search_page/Home_page
app.get('/basicsearch', searchController.showForm);

//search for menu items
app.get('/menuitems/:entryId', menuItemController.loadItem);
app.post('/menuitems/updateValues', menuItemController.updateValues);
app.post('/basicsearch/submit', searchController.searchMenuItems);

app.post('/advancedSearch', advSearchController.advancedSearch);

//rate
app.post('/submitRestaurant/:restaurantId', stormpath.loginRequired, ratingsController.rateVenues);
app.post('/submitItem/:foodId', stormpath.loginRequired, ratingsController.rateItems);

//Loading SocialShare page
app.get('/socialshare', stormpath.loginRequired, function (req, res){
  res.render('socialshare/new');
});

//socialshare/send
app.post('/socialshare/send',  ssController.sendemail);

//menuItemPage
app.post('/menuitems/:entryId', menuItemController.loadItem);
app.post('/menuitems/updateValues', menuItemController.updateValues);

 /* Start the web server.
 */
app.on('stormpath.ready',function () {
  console.log('Stormpath Ready');
  var port = process.env.PORT || 1337;
  app.listen(port, function () {
    console.log('Application running at http://localhost:'+ port);
  });
});

//put this app.use last.  The last .use.
app.use(function(err, req, res, next) {
  console.error("\t ***** MY error function.");
  console.error(err.stack);
  res.status(500).send('WTF Something broke!');
});

app.use(function(req, res, next) {
    console.error('Sorry cant find that!');
    res.redirect('/');
  //res.status(404).send('Sorry cant find that!');
});
