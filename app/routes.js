"use strict";

var path = require("path");

var Twitter = require('twitter');
var twitterClient = new Twitter({
	consumer_key: 'en2CmXHVE8r80i3Q83Y04Ijhw',
	consumer_secret: 'U3IZbytzRjVzBBnTAteL0j2YqVss5MpVXo4J1p17Omp1kWpWIZ',
	access_token_key: '407880627-iioHGFPHU1uHbaOWkRS1xNuCNmQXmpU5NKJh1rY4',
	access_token_secret: 'yjTIxoXIoemi6tA2kBR1drQIqAXCBquTel1nUcrmMUeox'
});

module.exports = function(app){
	app.get('/twitter/:handle', function (req, res) {
		var params = {screen_name: req.params.handle};
		twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
			if (!error) {
				res.setHeader("Content-Type", "text/html");
				res.writeHead(200);
				res.write('<h1>'+req.params.handle+'</h1>')
				tweets.forEach(function(tweet, i, tweets) {
					console.log(tweet.text);
					res.write(tweet.text);
					res.write('<br>');
				});
				console.log("Done");
				res.end();
			}
		});
		// res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
	});
}