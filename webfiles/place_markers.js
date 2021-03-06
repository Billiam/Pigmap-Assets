var places = markerList.extend({
  list : [],
  icons : {
    'home'    : 'http://google-maps-icons.googlecode.com/files/home.png',
    'town'    : 'http://google-maps-icons.googlecode.com/files/bigcity.png',
    'city'    : 'http://google-maps-icons.googlecode.com/files/smallcity.png',
    'outpost' : 'http://google-maps-icons.googlecode.com/files/tower.png',
    'project' : 'http://google-maps-icons.googlecode.com/files/construction.png',
    'mine'    : 'http://google-maps-icons.googlecode.com/files/mine.png',
    'farm'    : 'http://google-maps-icons.googlecode.com/files/farm.png',
    'cave'    : 'http://google-maps-icons.googlecode.com/files/spelunking.png'
  },
  DEFAULT_ICON : 'http://google-maps-icons.googlecode.com/files/fortress.png',
  
  stripColor : function(str) {
    return String(str).replace(/##[0-9a-f]/gi,'');
  },
  
  parseColor : function(str) {
    if(/##[0-9a-f]/i.test(String(str))) {
      //parse into spans
      var outputString =  str.replace(/##([0-9a-f])/gi, '</span><span class="mcchat-color-$1">') + '</span>';
      return outputString.replace(/^<\/span>/,'') + '</span>';
    }
    return str;
  },
  
  getIcon : function(group) {
    if (group && typeof this.icons[group] !== 'undefined') {
      return this.icons[group];
    } else {
      return this.DEFAULT_ICON;
    }
  },
  
  setGroupIcon : function(group, icon) {
    this.icons[group] = icon;
  },
  
  init : function(icons) {
    var This = this;
    
    for(group in icons) {
      this.setGroupIcon(group, icons[group]);
    }
    
    $.get('places.txt', function(data) {
      var lines = data.replace(/^\s+|\s+$/g,'').split("\n");
      for(var i=1, l=lines.length; i<l; i++) {
        var group = false;

        var d = lines[i].split(' ');
      	var converted = fromWorldToLatLng(d[0], d[1], d[2]);
      	
        var title = d.slice(4).join(' ');
        
        var match = title.match(/^\[(.*)\] (.*)/);
        
        if (match) {
          group = match[1];
          title = match[2];
        }
        
        var icon = This.getIcon(group);

        var marker = new mapPlace(This.stripColor(title), converted, group, icon);
        This.addMarker(title, marker);
      }
    }, 'text');
  },
  deleteMarkers : function() {
    for(var i=0, i=this.list.length; i<l; i++) {
      this.list[i].setMap(null);
    }
    this.list = [];
  }
});
var mapPlace = mapItem.extend({
  group : null,
  init : function(name, latLng, group, icon) {
    this._super({name:name}, latLng);
    this.title = name;
    this.setGroup(group);
    this.setIcon(icon);
  },
  getGroup : function() {
    return this.group;
  },
  setGroup : function(group) {
    this.group = group;
  },
  prepare : function() {
    this.getMarker();
  }
});
