"use strict"; 

/* dependencies */
var express  = require('express');
var app      = express();                      
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)

/* init packages */
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));    /* log everything to console */
app.use(bodyParser.urlencoded({'extended' : 'false'}));
app.use(bodyParser.json());

// require(__dirname+'/app/routes.js')(app)
app.get('/twitter', function (req, res) {
    console.log("Got it");
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

/* server start */
app.listen(8080);
console.log("App listening on port 8080");