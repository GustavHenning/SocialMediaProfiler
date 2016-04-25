"use strict";

var path = require("path");

var Twitter = require('twitter');
var twitterCfg = require('../config/twitter.json');

var instagramCfg = require('../config/instagram.json');

var instagram = require('nodestagram').createClient(instagramCfg.client_id, instagramCfg.client_secret);

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

	app.post('/searches', function(req, res) {
		console.log("yo0");
		instagram.users.search("Perkola", function (users, error) {
			console.log(users);
		});
		res.setHeader("Content-Type", "text/html;Charset=utf-8");
		res.writeHead(200);
		twitterClient.get('users/search', {q: req.body.fullName}, function(error, users, response){
			res.write('<ul>');
			users.forEach(function(user, i, users) {
				res.write('<li>'+user.name+' <em>'+user.screen_name+'</em></li>');
			});
			res.write('</ul>');
			res.end()
		});
	});

	app.get("/", function(req, res) {
		res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
	});
}
