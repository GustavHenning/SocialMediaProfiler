"use strict";

var path = require("path");
var jsdom = require('jsdom');
var async = require('async');
var Q = require('q');

/* configs */
var twitterCfg = require('../config/twitter.json');
var instagramCfg = require('../config/instagram.json');
var facebookCfg = require('../config/facebook.json');

/* clients */
var instagramClient = require('nodestagram').createClient(instagramCfg.client_id, instagramCfg.client_secret);
var twitterClient = require('twitter')(twitterCfg);
var facebookClient = require('fbgraph');

var profiler = require('../lib/profiler');

var TESTING = false;
var fbTests = require('../testPosts/fbTest.json');
var instaTests = require('../testPosts/instaTest.json');

var mediaPic = {};
mediaPic["facebook"] = "http://imgur.com/jA79lqd.png";
mediaPic["twitter"] = "http://imgur.com/afc5psg.png";
mediaPic["instagram"] = "http://imgur.com/mIn2nqX.png";
mediaPic["linkedin"] = "http://imgur.com/xwsrA5H.png";

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
    var printHit = function(s) {
      res.write("<li>" + s + "</li>");
    }

    /* Given a name, do a generic search for data. */

    Q.fcall(sendHeaders)
      .then(function() {
        return promiseTwitterSearch(req.body.fullName);
      })
      .then(function(hits) {
        for (var i = 0; i < hits.length; i++) {
          var user = hits[i];
          //printHit(user.screen_name + ": twitter");
          profiler.putData(user.screen_name, "twitter", user);
        }
      }, function(err) {
        console.error("twitterSearch failed: " + err);
      })
      .then(function() {
        return promiseInstagramSearch(req.body.fullName);
      })
      .then(function(hits) {
        for (var i = 0; i < hits.length; i++) {
          var user = hits[i];
          //printHit(user.full_name + ": instagram");
          profiler.putData(user.full_name, "instagram", user);
        }
      }, function(err) {
        console.error("instagramSearch failed: " + err);
      }).then(function() {
				/* FACEBOOK UNDER CONSTRUCTION  */
				/* Start here: https://www.npmjs.com/package/fbgraph */
				var authUrl = facebookClient.getOauthUrl({
				"client_id" : facebookCfg.client_id,
				"redirect_uri" : facebookCfg.redirect_uri
				});
			console.error(authUrl); /* we gotta make some kind of request here */
				 facebookClient.authorize({
					"access_token" : facebookCfg.access_token,
					"client_id" : facebookCfg.client_id,
					"redirect_uri" : facebookCfg.redirect_uri,
					"client_secret" : facebookCfg.client_secret
				}, function(err, facebookRes){
					if(err){
						console.error("fb auth failed: ");
						console.error(err);
						return;
					}
					var graphObject = facebookClient
						.get(req.body.fullName, function(err, res) {
							if(err){
								console.error("fb failed: ");
								console.error(err);
								return;
							}
							console.log(res); // { id: '4', name: 'Mark Zuckerberg'... }
						});
				});
      }, function(err) {
        console.error("facebookSearch failed: " + err);
      })
      .then(function() {
        /* TEST PROFILES */
        if (TESTING) {
          console.log("Testing enabled: adding dummy profiles");
          for (var testProfile in fbTests) {
            printHit("[TestProfile] " + fbTests[testProfile].name + ": facebook");
            profiler.putData(fbTests[testProfile].name, "facebook", fbTests[testProfile]);
          }
          for (var testProfile in instaTests) {
            printHit("[TestProfile] " + instaTests[testProfile].name + ": instagram");
            profiler.putData(instaTests[testProfile].name, "instagram", instaTests[testProfile]);
          }
        }
      })
      .then(function() {
        profiler.setRelevance();
        injectResults(res, profiler.combineProfiles());
        res.write('<h1>Done!</h1>');
        res.end();
      });

    /* TODO: Add additional searches based on usernames(?) */

  });
}

var promiseTwitterSearch = function(name) {
  var deferred = Q.defer();
  twitterClient.get('users/search', {
    q: name
  }, function(err, users, response) {
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
};

var promiseInstagramSearch = function(name) {
  var deferred = Q.defer();
  instagramClient.users.search(name, function(users, err) {
    console.log(users);
    var hits = [];
    if (!err) {
      users.forEach(function(user, i, users) {
        hits.push(user);
      });
      deferred.resolve(hits);
    } else {
      console.log(err);
      deferred.reject(err);
    }
  });
  return deferred.promise;
};
/* Injects the JSON response from the profiler into the DOM */
var injectResults = function(res, profiles) {
  res.write("<div class='row' style='max-width:600px; margin:auto;'>");
  for (var prof in profiles) {
    var media = Object.keys(profiles[prof]);
    res.write("<div class='col-md-6'>"); /* 4 needs to be replaced by number of social medias in json */
    /* Social media pictures */
    for (var n in media) {
      if (mediaPic[media[n]]) {
        res.write("<img src='" + mediaPic[media[n]] + "' style='max-width:50px;max-height:50px;' />");
      }
    }
    /* Actual info */
    injectJSON(res, profiles[prof]);
    res.write("</div>");
  }
  res.write("</div>");
};

var injectJSON = function(res, json) {
  var seen = [];
  /* Not combined result */
  if (Object.keys(json).length > 5) {
    var keys = Object.keys(json);
    injectImage(res, mediaPic[json["apiType"]]);
    for (var ke in keys) {
      var s = json[keys[ke]];
      /* images */
      if (isImage(s) && seen.indexOf(s.replace("https", "http")) == -1) {
        injectImage(res, s);
        seen.push(s.replace("https", "http"));
      }
    }
    for (var ke in keys) {
      var s = json[keys[ke]];
      if (!isImage(s)) {
        injectString(res, keys[ke], s);
      }
    }
  } else { /* combined */
    for (var k in json) {
      var keys = Object.keys(json[k]);
      for (var ke in keys) {
        var s = json[k][keys[ke]];
        if (isImage(s) && seen.indexOf(s.replace("https", "http")) == -1) {
          injectImage(res, s);
          seen.push(s.replace("https", "http"));
        }
      }
    }
    for (var k in json) {
      var keys = Object.keys(json[k]);
      for (var ke in keys) {
        var s = json[k][keys[ke]];
        if (!isImage(s)) {
          injectString(res, keys[ke], s);
        }
      }
    }
  }
};

var isImage = function(s) {
  return s.indexOf("http") == 0 && (s.indexOf(".jpg") > -1 || s.indexOf(".jpeg") > -1 || s.indexOf(".png") > -1 || s.indexOf(".gif") > -1);
};

var injectImage = function(res, i) {
  res.write("<img src='" + i + "' style='max-width:200px;max-height:200px;'/>");
};
var injectString = function(res, key, s) {
  if (s.length > 1 && key !== "apiType" && key.indexOf("color") === -1 && key.indexOf("id") === -1) { /* other fields */
    res.write("\n <p><b>" + key.replace("_", " ").replace("_", " ") + ": </b>");
    res.write(s + "</p>");
  }
};
