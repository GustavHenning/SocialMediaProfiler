"use strict";

var OU = require('./objectUtils.js');
var relQueue = require('./relevanceQueue.js');

var isString = OU.isString;
var isArray = OU.isArray;

var RELEVANCE_START = 0,
  RELEVANCE_EQUAL = 100,
  RELEVANCE_CONTAINS = 10;

var data = []; /* stores raw profiles */
var relevance = []; /* stores the scores between said profiles */

/**
* TODO: Add traversal algorithm, combining profiles and returning those objects
*/

/**
 * Determines and returns the relevance between two json objects.
 */
var relevanceOf = function(jsonOne, jsonTwo) {
  var rel = RELEVANCE_START;
  for (var keyOne in jsonOne) {
    for (var keyTwo in jsonTwo) {
      if (jsonOne[keyOne] == jsonTwo[keyTwo]) {
        console.log("Equals: " + jsonOne[keyOne] + " == " + jsonTwo[keyTwo]);
        rel += RELEVANCE_EQUAL;
      } else if ((jsonOne[keyOne].length > 2 && jsonTwo[keyTwo].length > 2) && (jsonOne[keyOne].indexOf(jsonTwo[keyTwo]) > -1 ||
        jsonTwo[keyTwo].indexOf(jsonOne[keyOne]) > -1)) {
          var wordsOne = jsonOne[keyOne].indexOf(" ") > -1 ? jsonOne[keyOne].split(" ") : [jsonOne[keyOne]];
          var wordsTwo = jsonTwo[keyTwo].indexOf(" ") > -1 ? jsonTwo[keyTwo].split(" "): [jsonTwo[keyTwo]];
          for(var wordOneKey in wordsOne){
            for(var wordTwoKey in wordsTwo){
              if(wordsOne[wordOneKey] === wordsTwo[wordTwoKey]){
                rel += RELEVANCE_CONTAINS;
              }
            }
          }
          console.log("Contains: " + jsonOne[keyOne] + " =? " + jsonTwo[keyTwo]);
      }
    }
  }
  return rel;
};
/**
 * Uses the data object to set relevances between the apiType and users
 */
var setRelevance = function() {
  for (var keyOne in data) {
    if (!relevance[keyTwo]) {
      relevance[keyOne] = [];
    }
    for (var keyTwo in data) {
      if (!relevance[keyTwo]) {
        relevance[keyTwo] = [];
      }
      if (data[keyOne].apiType === data[keyTwo].apiType) {
        continue;
      } else {
        var rel = relevanceOf(data[keyOne], data[keyTwo]);
        if(rel > 0){
          relQueue.put(keyOne, keyTwo, data[keyOne].apiType, data[keyTwo].apiType, rel);
        }
        relevance[keyOne][keyTwo] = rel;
        relevance[keyTwo][keyOne] = rel;
      }
    }
  }
  printRelevances();
};
/*
* Combines the profiles stored in relevance until all non-negative relevances
* have been accounted for. Returns the profiles as JSON.
*/
var combineProfiles = function() {
    console.log("Combining profiles");
    var returnData = [];
    while(relQueue.hasNext()){
      var combined = combine(relQueue.getNext());
      var didCombine = false;
      /* Keep building on existing if we find it */
    mainloop:
      for(var key in returnData){
        for(var apiType in returnData[key]){
          var other;
          var shouldBeAdded = false;
          for(var cKey in combined){
          //console.log(returnData[key][apiType]);
          //console.log(combined[cKey]);
          if(jsonEqual(returnData[key][apiType], combined[cKey])){
            //console.log("equal " + cKey);
            if(other){
              returnData[key][other] = combined[other];
              didCombine = true;
              break mainloop;
            } else {
              shouldBeAdded = true;
            }
            if(shouldBeAdded){
              returnData[key][cKey] = combined[cKey];
              didCombine = true;
              break mainloop;
            }
          } else {
            other = cKey;
          }
        }
      }
      }
      /* else just add*/
      if(!didCombine){
        returnData.push(combined);
      }
      //printRelevances();
    }
    console.log(returnData);
    returnData = addTrailingData(returnData);
    clearData();
    //console.log(returnData);
    return returnData;
};
var jsonEqual = function(json1, json2){
  return JSON.stringify(json1) === JSON.stringify(json2);
};

var clearData = function(){
    data = [];
    relevance = [];
    relQueue.clearQueue();
};

/*
* Combines two profiles into one, removes all other relevances related to those
* two apiTypes in regard to each others' types. Returns the combined object
*/
var combine = function(queueObject){
  var combined = {};
  /* fill the combined data object */
  combined[data[queueObject.x]["apiType"]] = data[queueObject.x];
  combined[data[queueObject.y]["apiType"]] = data[queueObject.y];
  /* fill adjacent rows and cols with zeroes (removes duplication) */
  for(var key in relevance[queueObject.x]){
    if(relevance[queueObject.x][key].apiType === data[queueObject.y]["apiType"]){
    relevance[queueObject.x][key] = 0;
    }
  }
  for(var key in relevance[queueObject.y]){
    if(relevance[queueObject.y][key].apiType === data[queueObject.x]["apiType"]){
      relevance[queueObject.y][key] = 0;
    }
  }
  /* remove objects in the queue with the exact same apiTypes */
  relQueue.removeSimilarCandidates(queueObject);
  return combined;

};
/*
* Adds the remaining non-combined data to the return data array.
*/
var addTrailingData = function(combined){
  var toAdd = [];
  var tot = 0;
  for(var dKey in data){
    var found = false;
    combloop:
    for(var key in combined){
      for(var apiType in combined[key]){
        if(jsonEqual(data[dKey], combined[key][apiType])){
          found = true;
          break combloop;
        }
      }
    }
    if(!found){
      toAdd.push(data[dKey]);
    }
    tot++;
  }
    for(var key in toAdd){
      combined.push(toAdd[key]);
    }
    console.log(toAdd.length + " / " + tot + " were not combined");
    return combined;
};

/* Given a json object, returns a json object where only string values remain
 *  Limited to two levels of nested json.
 */
var purify = function(jsonData) {
  for (var key in jsonData) {
    if (!(isString(jsonData[key]))) {
      jsonData[key] = purifyHelp(jsonData, key);
      delete jsonData[key];
    }
  }
  return jsonData;
};
var flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};

var purifyHelp = function(jsonData, key){
  if (isArray(jsonData[key])) {
    for (var arrayKey in jsonData[key]) {
      if (isArray(jsonData[key][arrayKey])) {
        console.log("Is array: " + jsonData[key][arrayKey]);
        purifyHelp(jsonData[key], arrayKey);
      } else {
        if (isString(jsonData[key][arrayKey])) {
          console.log("Is string: " + jsonData[key][arrayKey]);
          jsonData[key + "_" + arrayKey] = jsonData[key][arrayKey];
        }
      }

    }
  }
  return jsonData;
};
/**
* Puts data based on userID(unique!),
* apiType(e.g. twitter) and jsonData(json structured response)
*
 */
var putData = function(userID, apiType, jsonData) {
  if (!userID || !apiType || !jsonData) {
    console.warn("Invalid data");
    console.warn("userID:" + userID);
    console.warn("apiType: " + apiType);
    console.warn("jsonData: " + jsonData ? JSON.stringify(jsonData) : jsonData);
    return;
  }
  jsonData["apiType"] = apiType;
  data[apiType + "_" + userID] = purify(flatten(jsonData));
  console.log(data[apiType + "_" + userID]);

};

var printRelevances = function(){
  var matrix = "";
    for(var keyOne in relevance){
      for(var keyTwo in relevance[keyOne]){
        matrix += parseInt(relevance[keyOne][keyTwo]) + ", ";
      }
      matrix += '\n';
    }
    console.log(matrix);
};

module.exports = {
  putData: putData,
  setRelevance: setRelevance,
  printRelevances : printRelevances,
  combineProfiles : combineProfiles
};
