"use strict";

var OU = require('./objectUtils.js');

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
              } else {
                rel -= RELEVANCE_CONTAINS / 3;
              }
            }
          }
          console.log("Contains: " + jsonOne[keyOne] + " =? " + jsonTwo[keyTwo]);
        rel += RELEVANCE_CONTAINS;
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
        relevance[keyOne][keyTwo] = rel;
        relevance[keyTwo][keyOne] = rel;
      }
    }
  }
  printRelevances();
};
/* Given a json object, returns a json object where only string values remain
 *  Limited to two levels of nested json.
 */
var purify = function(jsonData) {
  for (var key in jsonData) {
    if (!(isString(jsonData[key]))) {
      if (isArray(jsonData[key])) {
        for (var arrayKey in jsonData[key]) {
          if (isString(jsonData[key][arrayKey])) {
            jsonData[key + "_" + arrayKey] = jsonData[key][arrayKey];
          }
        }
      }
      delete jsonData[key];
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
  data[apiType + "_" + userID] = purify(jsonData);
  //console.log(data[apiType + "_" + userID]);

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
  printRelevances : printRelevances
};
