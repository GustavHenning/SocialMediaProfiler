"use strict";

var path = require("path");

var Twitter = require('twitter');
var twitterCfg = require('../config/twitter.json');
var jsdom = require('jsdom');
var twitterClient = new Twitter(twitterCfg);
var async = require('async');

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
		res.setHeader("Content-Type", "text/html;Charset=utf-8");
		res.writeHead(200);
		twitterClient.get('users/search', {q: req.body.fullName}, function(error, users, response) {
			res.write('<h1>Twitter:</h1><ul>')
			var calls = [];
			users.forEach(function(user, i, users) {
				calls.push(function(callback) {
					jsdom.env(
						"http://facebook.com/"+user.screen_name,
						["http://code.jquery.com/jquery.js"],
						function (err, window) {
							var name = window.$("#fb-timeline-cover-name").text();
							if (!err) {
								if (name != "") {
									res.write('<li>Handle <strong>'+user.screen_name+'</strong> is used on Facebook by '+name);
									if (name.toLowerCase() == user.name.toLowerCase()) {
										res.write(': seems to be the same person!</li>');
									} else {
										res.write(': no clear connection</li>');
									}
								}
							}
							callback();
						}
						);
				});
				res.write('<li>'+user.name+' has Twitter handle <strong>'+user.screen_name+'</strong></li>');
			});
			async.parallel(calls, function(err, result) {
				if (err)
					return console.log(err);
				res.end();
			});
		});
	});


	app.get("/", function(req, res) {
		res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
	});
}
