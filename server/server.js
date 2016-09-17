'use strict';
var express     = require('express');
var path        = require('path');
var bodyp       = require('body-parser');
var stormpath   = require('express-stormpath');
var Fuse        = require('fuse.js');
var app         = express();
var session     = require('client-sessions');
var MongoClient = require('mongodb').MongoClient;
var request = require("request");

// begin
var url = require('url');
var cheerio     = require('cheerio');
//var interceptor = require('express-interceptor');
// var finalParagraphInterceptor = interceptor(function(req, res){
  // return {
    // // Only HTML responses will be intercepted 
    // isInterceptable: function(){
        // console.log('\n\n\t **** 11 interceptor(function(req, res){\n');
        // console.log(res);
        // console.log(req.headers.referer);
      // return /text\/html/.test(res.get('Content-Type')); 
    // },
    // // Appends a paragraph at the end of the response body 
    // intercept: function(body, send) {
        // console.log('\n\n\t **** 22 interceptor(function(req, res){\n');
      // var $document = cheerio.load(body);
      
      // console.log( "$document('#document').attr('value') = \n" + 
      // $document('input[type="text"]') );
      
      // console.log($document('input[type="text"]').length);
      
      // // search pattern
      // var pattern = /ReferralId/i;
      // for (var idx = 0, len = $document('input[type="text"]').length; idx < len; idx++) {
          // console.log( $document('input[type="text"]')[idx].attribs.name); 
          
        // if (pattern.test($document('input[type="text"]')[idx].attribs.name) ) {
            // $document('input[type="text"]')[idx].attribs.value = 'your mommoy';
        // }     
      // };
     
      // $document('body').append('<p>From interceptor! MMM222MMMMMMMMMMMM</p>');
      // send($document.html());
    // }
  // };
// })
// Add the interceptor middleware 
////app.use(finalParagraphInterceptor);
//
// end
// FM new routes begin
var venues = require('./routes/venues');
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

//app.use(modify);  // new shit
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
    console.log('\n\t *** req.db = db;\n\n')
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

//
function modify(req, res, next){
  //res.body = "this is the modified/new response";
console.log('\n\t *** function modify(req, res, next) BEGIN{\n\n');
console.log(req);
    console.log('\n\t *** \n\n');
    req = "";
    res.body="what the fuck this is the modified/new response";
console.log(res);

console.log('\n\t *** function modify(req, res, next) END{\n\n');

  next();
}




app.use(stormpath.init(app, {
    
    //expandCustomData: true, // this will help you out
    expand: {
        customData: true
    },
    
  web: {
      
          register: {
        form: {
          fields: {
            ReferralId: {
              enabled: true,
              label: '*Referral ID',
              placeholder: 'Spread the word earn point$. Quit your day job.',
              required: false,
              type: 'text'
            }
          }
        }
    },
    
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
  
   preRegistrationHandler: function (formData, req, res, next) {
       console.log("preRegistrationHandler,  formData = "+ JSON.stringify(formData) );
       //formData.email = "wtf@yahoo.com";
       
       console.log(req);
       console.log(req.query);
       console.log(req.body.ReferralId);
       //req.body.ReferralId=req.query.rid; //'youyouyou';
       //console.log(req);
    // if (formData.email.indexOf('@some-domain.com') !== -1) {
      // return next(new Error('You\'re not allowed to register with \'@some-domain.com\'.'));
    // }
    //interceptor();
    next();
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

// fm new referral registration begin
//app.get('/referralid/:id',  bodyp.json(), function(req,res,next){
app.get('/referralid/:id', function(req,res,next){    
    var id = "asdf";

    var referralID = req.params.id; //(req.query.rfid) ? req.query.rfid : '';
    console.log(req.headers.host);
var requrl = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl,
});
console.log("requrl = " +  requrl);
var regUrl = url.format({protocol: req.protocol, host: req.get('host'), pathname: "register"});
console.log("regUrl = " +  regUrl);    
    
    var options = { method: 'GET',
	  //url: 'http://localhost:3003/register',
      url: regUrl//, //'http://localhost:3003/register',
	  // headers: 
	   // { //'cache-control': 'no-cache',
	     // 'content-type': 'application/json' }
         };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

      // add form action = "./register"
      var $document = cheerio.load(body);
      
      var fuck = $document('form').attr('method');
      $document('form').attr('action', './register');
      var action = $document('form').attr('action');
      console.log("action = "+ action);
      
            // search pattern
      var pattern = /ReferralId/i;
      //for (var idx = 0, len = 3; idx < len; idx++) {
      for (var idx = 0, len = $document('input[type="text"]').length; idx < len; idx++) {
          console.log( $document('input[type="text"]')[idx].attribs.name); 
          
        if (pattern.test($document('input[type="text"]')[idx].attribs.name) ) {
            $document('input[type="text"]')[idx].attribs.value = referralID; //'your mommoy';
        }
          
          // console.log('\n'+ $document('input[type="text"]')[idx].attribs.value);   
          // console.log( '\n\n');   
        // console.log( $document('input[type="text"]')[idx]);       
      };
      
      
      //$document.getElementById("form").action = "form_action.asp";
      $document('body').append('<p>form mod</p>');
	  //res.send(body);
      res.send($document.html());
      //res.send(response);
      
	  //console.log("\n\n");
	  //console.log(response.body);
	});     
    //next();
});


app.get('/referralid',  bodyp.json(), function(req,res,next){
    console.log("app.get('/referralid', function(req,res,next){");
    //res.send('<h1>what the fuck</h1>');
    console.log(req.query.rfid);
    var referralID = (req.query.rfid) ? req.query.rfid : '';
    console.log(req.headers.host);
var requrl = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl,
});
console.log("requrl = " +  requrl);
var regUrl = url.format({protocol: req.protocol, host: req.get('host'), pathname: "register"});
console.log("regUrl = " +  regUrl);    
    
    var options = { method: 'GET',
	  //url: 'http://localhost:3003/register',
      url: regUrl//, //'http://localhost:3003/register',
	  // headers: 
	   // { //'cache-control': 'no-cache',
	     // 'content-type': 'application/json' }
         };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

      // add form action = "./register"
      var $document = cheerio.load(body);
      
      var fuck = $document('form').attr('method');
      $document('form').attr('action', './register');
      var action = $document('form').attr('action');
      console.log("action = "+ action);
      
            // search pattern
      var pattern = /ReferralId/i;
      //for (var idx = 0, len = 3; idx < len; idx++) {
      for (var idx = 0, len = $document('input[type="text"]').length; idx < len; idx++) {
          console.log( $document('input[type="text"]')[idx].attribs.name); 
          
        if (pattern.test($document('input[type="text"]')[idx].attribs.name) ) {
            $document('input[type="text"]')[idx].attribs.value = referralID; //'your mommoy';
        }
          
          // console.log('\n'+ $document('input[type="text"]')[idx].attribs.value);   
          // console.log( '\n\n');   
        // console.log( $document('input[type="text"]')[idx]);       
      };
      
      
      //$document.getElementById("form").action = "form_action.asp";
      $document('body').append('<p>form mod</p>');
	  //res.send(body);
      res.send($document.html());
      //res.send(response);
      
	  //console.log("\n\n");
	  //console.log(response.body);
	});     
    //next();
});

app.get('/myRegisterWithNoHands', function(req,res,next){

var options = { method: 'POST',
	  url: 'http://localhost:3003/register',
	  headers: 
	   { //'cache-control': 'no-cache',
	     'content-type': 'application/json' },
	  form: 
	   { email: 'rose@yahoo.com',
	   	 givenName: 'Rose',
	   	 surname: 'Referral',
	     password: 'Fm123456',
	     ReferralId: 'ref-didyoudoit' },
	  json: true };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);
	  //console.log("\n\n");
	  //console.log(response.body);
	});  
  
  
  
  
  next();
});
// fm new referral registration end

// for testing.!!!
app.all ('/ping', bodyp.json(), pingController.ping);
//app.all ('/ping',stormpath.loginRequired, pingController.ping);console.log(req.query);

app.get('/',stormpath.loginRequired,profileController.loadProfile);

//app.post('/profile/update',profileController.editProfile);
app.post('/profile/update', stormpath.loginRequired, profileController.editProfile);

app.get('/ratings/new',stormpath.loginRequired, ratingsController.newRatings);

// Loading Basic_Search_page/Home_page
app.get('/basicsearch', searchController.showForm);

//search for menu items
app.get('/menuitems/:entryId', menuItemController.loadItem);
app.post('/menuitems/updateValues', menuItemController.updateValues);
app.post('/basicsearch/submit', bodyp.json(), searchController.searchMenuItems);

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

// FM new routes begin
app.use('/v1/api/venues', venues);
// FM new routes end

//put this app.use last.  The last .use.
app.use(function(err, req, res, next) {
  console.error("\t ***** MY error function.");
  console.error(err.stack);
  res.status(500).send('WTF Something broke!');
});

app.use(function(req, res, next) {
    var requrl = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl,
});
    console.error('Sorry cant find that! ' + requrl);

    res.redirect('/');
  //res.status(404).send('Sorry cant find that!');
});
