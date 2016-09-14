var express = require('express');
var router = express.Router();
var bodyp  = require('body-parser');
var venueController    = require('../controllers/venue-controller');
var pingController    = require('../controllers/ping-controller');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('venues Time: ', Date.now());
  console.time('test');
  console.timeEnd('test');
  next();
  console.timeEnd('test');
});

// for testing.!!!
router.all ('/ping', bodyp.json(), pingController.ping);

// define the home page route
router.get('/', function(req, res) {
  res.send('<h1 style="color:green">Venues home page</h1>');
});

router.get ('/:id', function(req, res) {
    var idd = req.params.id;
    if(req.params.id === undefined ||  req.params.id == 0) {
        res.json({"message" : "You must pass ID other than 0"});   
        return;    
    }
    res.json({"id" : idd});   
  //res.send('<h1 style="color:pink">Venues home page</h1>' + idd);
});

router.post ('/dbupdatevenues', bodyp.json(), venueController.UpdateVenuesInDBbyLocation);
router.post ('/list', bodyp.json(), venueController.list);
router.post ('/info/:id', bodyp.json(), venueController.venueInfo);
router.post ('/list/menu', bodyp.json(), venueController.listMenu);
router.post ('/list/menu/tofancytreeDB', bodyp.json(), venueController.listMenu_tofancytreeDB);
router.post ('/list/menu/loadfromfsq', bodyp.json(), function(req, res) {
    venueController.loadFromFsq(req, res, function(err, results){
        if(err) {
            res.json({err: err, results: results});
        }
        else {
            res.json(results);            
        }
    });
});

router.post ('/list11', bodyp.json(), function(req, res) {
    console.log(JSON.stringify(req.body.lat) );
    console.log('sssss ' + req.params); 
    var idd = 'wtf'; //req.params.id;
    // if(req.params.id === undefined ||  req.params.id == 0) {
        // res.json({"message" : "You must pass ID other than 0"});   
        // return;    
    // }
    var wtf = require('../../venues.json');
    console.log(wtf);
    res.json(wtf); 
    //res.json({"id" : idd});   
  //res.send('<h1 style="color:pink">Venues home page</h1>' + idd);
});


// define the about route
router.get('/about', function(req, res) {
  res.send('the api for Venues<br/>'
            +'<br/>get'
            +'<br/>List'
  );
});

module.exports = router;