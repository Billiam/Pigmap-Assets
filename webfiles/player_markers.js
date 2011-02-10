var playerMarkers = markerList.extend({
  interval : null,
  config : {duration:15000, animate:true},

  fetchMarkers : function() {

    var This = this;
    var playerNames = {};
  
    $.getJSON('markers.json', function(data) {
      for (i in data) {
        var item = data[i];
        var name = item.msg;
      
        var converted = fromWorldToLatLng(item.x, item.y, item.z);
        
        //if marker exists, move marker
        if(typeof This.list[name] !== "undefined") {
          This.list[name].moveTo(converted);
        } else {
          var marker = new mapPlayer(item, converted);
          This.addMarker(name, marker);
        }
        
        playerNames[name] = 1;
      }
    
      for(name in this.list) {
        if ( ! playerNames[name]) {
          This.deleteMarker[name];
        }
      }
    });
  },
  
  deleteMarker : function(name) {
    this._super.deleteMarkerByIndex(name);
  },

  init : function() {
    var This = this;
    This.interval = setInterval(function(){This.fetchMarkers()}, This.config.duration);
    This.fetchMarkers();
  }
});


var mapPlayer = mapItem.extend({
  config : {animate:true, animateDuration:14000},
  init : function(itemData, coordinates) {
    this._super(itemData, coordinates);
    this.title = itemData.msg;
  },
  getIcon : function() {
    return 'helper/player-avatar.php?s=1&format=flat&bc=fff&bw=1&player=' + encodeURIComponent(this.getTitle());
  },
  getInfoWindowMarkup : function() {
    return '<div class="infoWindow" style="width: 300px;height:200px;"><img src="helper/player-avatar.php?format=flat&s=5&player=' +encodeURIComponent(this.getTitle())  + '&s=8"/><h1>' + this.getTitle() + '</h1></div>';
  }
});