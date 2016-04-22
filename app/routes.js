"use strict";

var path = require("path");

var Twitter = require('twitter');
var twitterCfg = require('../config/twitter.json');

var twitterClient = new Twitter(twitterCfg);

module.exports = function(app){
	app.get('/twitter/:handle', function (req, res) {
		var params = {screen_name: req.params.handle};
		twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
			if (!error) {
				res.setHeader("Content-Type", "text/html");
				res.writeHead(200);
				res.write('<h1>'+req.params.handle+'</h1>');
				tweets.forEach(function(tweet, i, tweets) {
					console.log(tweet.text);
					res.write(tweet.text);
					res.write('<br>');
				});
				console.log("Done");
				res.end();
			}
		});
	});
	app.get("/", function(req, res){
		res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
	});
}
