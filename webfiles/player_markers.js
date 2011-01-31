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

var mapPlayer = Class.extend({
  itemData : null,
  name : null,
  infoWindow : null,
  config : {animate:true, animateDuration:14000},
  
  marker : null,

  setConfig : function(config) {
    this.config = config;
  },

  init : function(itemData, coordinates) {
    this.itemData = itemData;
    this.latLng = coordinates;
    this.name = itemData.msg;
  },

  setMarker : function(marker) {
    this.marker = marker;
  },

  delete : function() {
    if ( this.marker) {
      this.marker.setMap(null);
    }
  },

  moveTo : function(position) {
    var This = this;
    
    if ( this.config.animate ) {
      jQuery({wa:This.marker.position.wa, ya:This.marker.position.ya}).animate({wa:position.wa, ya:position.ya}, {
        duration:This.config.animateDuration,
        step: function() {
          var latlng = new google.maps.LatLng(this.wa, this.ya);
          This.marker.setPosition(latlng);
        }
      });
    } else {
      This.marker.setPosition(position);
    }
  },
  
  getMarker : function() {
    if ( ! this.marker) {
      var marker =  new google.maps.Marker({
        position: this.latLng,
        animation: this.config.animate ? google.maps.Animation.DROP : null,
        map: map,
        title: this.name,
        icon: 'helper/player-avatar.php?s=1&format=flat&bc=fff&bw=1&player=' + encodeURIComponent(this.name), //replace with path=<username>
        visible: true,
        zIndex: 999
      });
      
      this.setMarker(marker);
    }
    return this.marker;
  },
  
  prepare : function() {
    if ( ! this.infowindow) {
      var This = this;
      var c = '<div class="infoWindow" style="width: 300px"><img src="helper/player-avatar.php?format=flat&s=5&player=' +encodeURIComponent(this.name)  + '&s=8"/><h1>' + this.name + '</h1></div>';
      this.infowindow = new google.maps.InfoWindow({content: c});
      var marker = this.getMarker();
      
      google.maps.event.addListener(marker, 'click', function() {
        This.infowindow.open(map, marker);
      });
    }
  }
});
