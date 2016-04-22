"use strict";

var path = require("path");

var Twitter = require('twitter');
var twitterClient = new Twitter({
	consumer_key: 'en2CmXHVE8r80i3Q83Y04Ijhw',
	consumer_secret: 'U3IZbytzRjVzBBnTAteL0j2YqVss5MpVXo4J1p17Omp1kWpWIZ',
	access_token_key: '407880627-iioHGFPHU1uHbaOWkRS1xNuCNmQXmpU5NKJh1rY4',
	access_token_secret: 'yjTIxoXIoemi6tA2kBR1drQIqAXCBquTel1nUcrmMUeox'
});

var instagramClient = require('instagram').createClient('<client_id>', '<client_secret>');

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
}