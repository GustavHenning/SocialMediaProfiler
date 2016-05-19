"use strict";

var queue = [];

/**
* Puts a connection between two apis in the queue based on relevance
*/
var put = function (x, y, apiTypeX, apiTypeY, relevance) {
  var next = {};
  next.x = x;
  next.y = y;
  next.apiTypeX = apiTypeX;
  next.apiTypeY = apiTypeY;
  next.relevance = relevance;
  for(var i = 0; i < queue.length; i++){
    if(queue[i].relevance === relevance && sameConnection(x, y, queue[i])){
      return;
    }
  }

  for(var i = 0; i < queue.length; i++){
    if(relevance > queue[i].relevance){
      queue.splice(i, 0, next);
      return;
    }
  }
  queue.push(next);
};

var sameConnection = function(x, y, qObj){
  return (qObj.x === x && qObj.y === y) || (qObj.x === y && qObj.y === x);
};

var sameApiTypes = function(qObj, qObj2){
  return (qObj.apiTypeX === qObj2.apiTypeX && qObj.apiTypeY === qObj2.apiTypeY)
  || (qObj.apiTypeX === qObj2.apiTypeY && qObj.apiTypeY === qObj2.apiTypeX);
};
/*
* Removes connections in the queue that have the same apiTypes as qObj and
* includes either qObj.x or qObj.y
*/
var removeSimilarCandidates = function(qObj){
  for(var i = 0; i < queue.length; i++){
    if(sameApiTypes(qObj, queue[i]) && (qObj.x === queue[i].x || qObj.x === queue[i].y
    || qObj.y === queue[i].x || qObj.y === queue[i].y)){
      queue.splice(i, 1);
    }
  }
};

/*
* Returns the next connection and removes it from the queue
*/
var getNext = function(){
  var next = queue[0];
  if(queue.length == 1){
    queue = [];
  } else {
    queue.splice(0,1);
  }
  console.log("Queue size: " + queue.length);
  //console.log(queue);
  return next;
};
/* Returns true if and only if there are further connections in the queue */
var hasNext = function(){
  return queue.length > 0;
};

var clearQueue = function(){
  queue = [];
};

module.exports = {
  put : put,
  removeSimilarCandidates : removeSimilarCandidates,
  getNext, getNext,
  hasNext, hasNext,
  queue, queue,
  clearQueue : clearQueue
};
