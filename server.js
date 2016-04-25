<<<<<<< HEAD
"use strict"; 

/* dependencies */
var express  = require('express');
var app      = express();                      
=======
"use strict";

/* dependencies */
var express  = require('express');
var app      = express();
>>>>>>> 334d12399abc66c7d2da467a33e7b0e6001bc5a6
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)

/* init packages */
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));    /* log everything to console */
app.use(bodyParser.urlencoded({'extended' : 'false'}));
app.use(bodyParser.json());

<<<<<<< HEAD
require(__dirname+'/app/routes.js')(app)

/* server start */
app.listen(8080);
console.log("App listening on port 8080");
=======
require(__dirname + '/app/routes.js')(app);

/* server start */
app.listen(8080);
console.log("App listening on port 8080");
>>>>>>> 334d12399abc66c7d2da467a33e7b0e6001bc5a6
