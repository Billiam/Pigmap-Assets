/**
 * https://gist.github.com/58761
 **/
var DateHelper = {
  // Takes the format of "Jan 15, 2007 15:45:00 GMT" and converts it to a relative time
  // Ruby strftime: %b %d, %Y %H:%M:%S GMT
  time_ago_in_words_with_parsing: function(from) {
    var date = new Date; 
    date.setTime(Date.parse(from));
    return this.time_ago_in_words(date);
  },
  
  time_ago_in_words: function(from) {
    return this.distance_of_time_in_words(new Date, from);
  },
  distance_of_time_in_words: function(to, from) {
    var distance_in_seconds = Math.floor((to - from) / 1000);
    var distance_in_minutes = Math.floor(distance_in_seconds / 60);

    if (distance_in_seconds < 60) { return [distance_in_seconds + ' second' + (distance_in_seconds != 1 ? 's' :'') + ' ago', 1] }
    if (distance_in_minutes == 1) { return ['a minute ago', 60 - distance_in_seconds%60 ]}
    if (distance_in_minutes < 45) { return [distance_in_minutes + ' minutes ago', 60 - distance_in_seconds%60 ] }
    if (distance_in_minutes < 90) { return ['about 1 hour ago', 3600 - (distance_in_seconds)%3600 ] }
    if (distance_in_minutes < 1440) { return ['about ' + Math.floor(distance_in_minutes / 60) + ' hours ago', 3600 - distance_in_seconds%3600] }
    if (distance_in_minutes < 2880) { return ['1 day ago', 86400 - distance_in_seconds%86400] }
    if (distance_in_minutes < 43200) { return [Math.floor(distance_in_minutes / 1440) + ' days ago', 86400 - distance_in_seconds%86400] }
    if (distance_in_minutes < 86400) { return ['about 1 month ago', 2592000 - distance_in_seconds%2592000] }
    if (distance_in_minutes < 525960) { return [Math.floor(distance_in_minutes / 43200) + ' months ago', 2592000 - distance_in_seconds%2592000] }
    if (distance_in_minutes < 1051199) { return ['about 1 year ago', 31557600 - distance_in_seconds%31557600] }
    return ['over ' + Math.floor(distance_in_minutes / 525960) + ' years ago', 31557600 - distance_in_seconds%31557600];
  }
};

  
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();


var dateUpdater = Class.extend({
  startTime : null,
  timer : null,
  updateNode : null,
  
  init : function(time) {
    this.startTime = time;
    this.updateNode = jQuery('#updateTime');
    this.update();
  },
  update : function() {
    var This = this;
    var time = DateHelper.time_ago_in_words(this.startTime);
    this.updateNode.html('<span class="updatedLabel">Last Updated: </span>' + time[0]);
    this.timer = setTimeout(function(){This.update()}, time[1] * 1000);
  }
});