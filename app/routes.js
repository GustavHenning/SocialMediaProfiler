"use strict";

var path = require("path");
var jsdom = require('jsdom');
var async = require('async');
var Q = require('q');

/* configs */
var twitterCfg = require('../config/twitter.json');
var instagramCfg = require('../config/instagram.json');

/* clients */
var instagramClient = require('nodestagram').createClient(instagramCfg.client_id, instagramCfg.client_secret);
var twitterClient = require('twitter')(twitterCfg);

var profiler = require('../lib/profiler');

module.exports = function(app) {

	app.get("/", function(req, res) {
		res.sendFile(path.resolve(__dirname + '/../public/index.html')) // load the single view file (angular will handle the page changes on the front-end)
	});

	app.post('/searches', function(req, res) {
		
		/* Helpers that use our res */

		var sendHeaders = function() {
			res.setHeader("Content-Type", "text/html;Charset=utf-8");
			res.writeHead(200);			
		}
		var printHit = function (s) {
			res.write("<li>"+s+"</li>");
		}

		/* Given a name, do a generic search for data. */

		Q.fcall(sendHeaders)
		.then(function() {
			return promiseTwitterSearch(req.body.fullName);
		})
		.then(function (hits) {
			for (var i = 0; i < hits.length; i++) {
				var user = hits[i]
				printHit(user.screen_name + ": twitter");
				profiler.putData(user.screen_name, "twitter", user);
			}
		}, function(err) {
			console.error("twitterSearch failed:"+err)
		})
		.then(function() {
			return promiseInstagramSearch('justin bieber');
		})
		.then(function(hits) {
			for (var i = 0; i < hits.length; i++) {
				printHit(hits[i].screen_name + ": instagram");
				profiler.putData(user.full_name.toString(), "instagram", user);
			}
		}, function(err) {
			console.error("instagramSearch failed:"+err)
		})
		.then(function() {
			profiler.setRelevance();
			res.write('<h1>Done!</h1>');
    		res.end();
		});

		/* TODO: Add additional searches based on usernames(?) */
		
	});
}

var promiseTwitterSearch = function(name) {
	var deferred = Q.defer();
	twitterClient.get('users/search', {q: name}, function(err, users, response) {
		var hits = []
		if (!err) {
			users.forEach(function(user, i, users) {
				hits.push(user);
			});
			deferred.resolve(hits) /* This is a little like a callback */
		} else {
			deferred.reject(err);
		}
	});
	return deferred.promise;
}

var promiseInstagramSearch = function(name) {
	var deferred = Q.defer();
	instagramClient.users.search(name, function(users, err) {
		var hits = []
		if (!err) {
			users.forEach(function(user, i, users) {
				hits.push(user)
			});
			deferred.resolve(hits);
		} else {
			deferred.reject(err);
		}
	});
	return deferred.promise;
}