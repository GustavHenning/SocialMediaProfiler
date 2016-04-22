"use strict";

module.exports = function(app){
	app.get('/twitter', function (req, res) {
		console.log("Got it");
		res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
}