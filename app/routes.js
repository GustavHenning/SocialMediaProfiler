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
				res.setHeader("Content-Type", "text/html;Charset=utf-8");
				res.writeHead(200);
				res.write('<h1>'+req.params.handle+'</h1>')
				res.write('<h2>'+tweets[0].user.description+'</h2>')
				console.log(tweets[0]);
				res.write('<ul>');
				tweets.forEach(function(tweet, i, tweets) {
					res.write('<li>'+tweet.text+'</li>');
				});
				res.write('</ul>');
				console.log("Done Twitter");
				instagramClient.users.search(req.params.handle, function (users, error) {
					console.log(users)
				});
				res.end();
			}
		});
	});

	app.get("/", function(req, res) {
		res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
	});
}
