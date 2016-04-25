"use strict";

var path = require("path");
var jsdom = require('jsdom');
var async = require('async');

/* configs */
var twitterCfg = require('../config/twitter.json');
var instagramCfg = require('../config/instagram.json');

/* clients */
var instagram = require('nodestagram').createClient(instagramCfg.client_id, instagramCfg.client_secret);
var twitterClient = require('twitter')(twitterCfg);

var profiler = require('../lib/profiler');


module.exports = function(app) {
  app.post('/searches', function(req, res) {
    res.setHeader("Content-Type", "text/html;Charset=utf-8");
    res.writeHead(200);
    /* Given a name, do a generic search for data.
     * TODO: Make async better, now we are chaining like plebs (Maybe use promises?) */
		var calls = [];
		/* TWITTER */
    twitterClient.get('users/search', { q: req.body.fullName }, function(err, users, response) {
      if (!err) {
        users.forEach(function(user, i, users) {
		      calls.push(function(callback) {
            profiler.putData(user.screen_name, "twitter", user);
						res.write("<li> " + user.screen_name + ": twitter </li>");
						callback();
          });
        });
      } else {
        console.error("Error searching for usernames on twitter: " + err);
      }
			/* INSTAGRAM */
			instagram.users.search(req.body.fullName, function(users, err) {
				if (!err) {
					users.forEach(function(user, i, users) {
						calls.push(function(callback) {
							profiler.putData(user.name.toString(), "instagram", user);
							res.write("<li> " + user.name.toString() + ": instagram </li>");
							callback();
						});
					});
				} else {
					console.error("Error searching for usernames on instagram: " + err);
				}
				/* TODO: Add general facebook, linkedin search */
				/* ASYNC */
				async.parallel(calls, function(err, result) {
					if (err)
						return console.log(err);
					profiler.setRelevance();
					res.write('<h1>Done!</h1>');
					res.end();
				});
			});
    });
		/* TODO: Add additional searches based on usernames(?) */
  });


  app.get("/", function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
  });
}



/*
    		twitterClient.get('users/search', {q: req.body.fullName}, function(error, users, response) {
    			//res.write('<h1>Twitter:</h1><ul>')
    			var calls = [];
    			users.forEach(function(user, i, users) {
    				calls.push(function(callback) {
    					jsdom.env(
    						"http://facebook.com/"''+user.screen_name,
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
    								console.log('Hopp: '+ name);
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
    								console.log(instaUser.id);
    								instagram.users.id(instaUser.id, function (instaUser2, error) {
    									res.write('<li>More instagram: '+JSON.stringify(instaUser2));
    								});
    							}
    						});
    					}
    				});
    				res.write('<li>'+user.name+' has Twitter handle <strong>'+user.screen_name+'</strong></li>');
    			});
    			async.parallel(calls, function(err, result) {
    				if (err)
    					return console.log(err);
    				res.end();
    			});
    		});
*/
