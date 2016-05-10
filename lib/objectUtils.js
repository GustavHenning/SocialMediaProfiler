"use strict";

module.exports = {
    isString : function(s){
      return (typeof s === 'string' || s instanceof String) && s.length > 0;
    },
    isArray : function(a){
      if(!a){
        return false;
      }
      return a.constructor === {}.constructor;
    }
};
