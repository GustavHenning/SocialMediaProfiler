"use strict";

var path = require("path");

var Twitter = require('twitter');
var twitterCfg = require('../config/twitter.json');

var instagramCfg = require('../config/instagram.json');

var instagram = require('nodestagram').createClient(instagramCfg.client_id, instagramCfg.client_secret);

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
			//res.write('<h1>Twitter:</h1><ul>')
			var calls = [];
			users.forEach(function(user, i, users) {
				res.write('<li>Twitter: '+user.name+' <em>'+user.screen_name+'</em></li>');
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
				calls.push(function(callback) {
					jsdom.env(
						"http://instagram.com/"+user.screen_name,
						["http://code.jquery.com/jquery.js"],
						function (err, window) {
							if (!err) {
								var name = window.$("._79dar");
								console.log('Hopp: '+name);
								if (name != "") {
									res.write('<li>Handle <strong>'+user.screen_name+'</strong> is used on Instagram by '+JSON.stringify(name));
									if (name.toString().toLowerCase() == user.name.toString().toLowerCase()) {
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
				instagram.users.search(user.screen_name, function (users, error) {
					if (!error) {
						users.forEach(function(instaUser) {
							if (user.name == instaUser.full_name) {
								res.write('<li>Instagram: <img src="'+instaUser.profile_picture+'">');
							}
						});
					}
				});
				//res.write('<li>'+user.name+' has Twitter handle <strong>'+user.screen_name+'</strong></li>');
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
