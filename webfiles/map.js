function CoordMapType() {
}

function CoordMapType(tileSize) {
  this.tileSize = tileSize;
}

CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var div = ownerDocument.createElement('DIV');
  var html = "(" + coord.x + ", " + coord.y + ", " + zoom + ")"
  + "<br />"
  + MCMapOptions.getTileUrl(coord, zoom);

  div.innerHTML = html;

  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  div.style.fontSize = '10';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px';
  div.style.borderColor = '#AAAAAA';
  return div;
};
  
// our custom projection maps Latitude to Y, and Longitude to X as normal,
// but it maps the range [0.0, 1.0] to [0, tileSize] in both directions
// so it is easier to position markers, etc. based on their position
// (find their position in the lowest-zoom image, and divide by tileSize)
function MCMapProjection() {
  this.inverseTileSize = 1.0 / config.tileSize;
}

MCMapProjection.prototype.fromLatLngToPoint = function(latLng) {
  var x = latLng.lng() * config.tileSize;
  var y = latLng.lat() * config.tileSize;
  return new google.maps.Point(x, y);
};

MCMapProjection.prototype.fromPointToLatLng = function(point) {
  var lng = point.x * this.inverseTileSize;
  var lat = point.y * this.inverseTileSize;
  return new google.maps.LatLng(lat, lng);
};

// pigmap lat/long converter
// this function takes its arguments in the *same order* as the previous
//  Overviewer version--minecraft X, minecraft Y, minecraft Z--so callers
//  do not need to be changed
// ...however, this one does not rename the variables, so what we call "y"
//  here is also called "y" in both minecraft and pigmap
// (the pigmap docs write coords in X,Z,Y order, so unfortunately
//  confusion is still possible, but at least the *names* are the same)
function fromWorldToLatLng(x, y, z)
{
  // the width and height of all the highest-zoom tiles combined, inverted
  var perPixel = 1.0 / (config.tileSize * Math.pow(2, config.maxZoom));
  
  var B = config.B;
  var T = config.T;
  
  // fail in a conspicuous way if tileSize doesn't match B and T
  if (config.tileSize != 64*B*T) {
      console.log("Tile size does not match 64*B*T");
      return new google.maps.LatLng(0.5, 0.5);
  }
  // the center of block [0,0,0] is at [2B, 64BT-17B] in the tile [tiles/2, tiles/2]
  var lng = 0.5 + 2*B * perPixel;
  var lat = 0.5 + (config.tileSize - 17*B) * perPixel;
  
  // each block on X adds [2B,-B]
  lng += 2*B * x * perPixel;
  lat += -B * x * perPixel;
  
  // each block on Y adds [0,-2B]
  lat += -2*B * y * perPixel;
  
  // each block on Z adds [2B,B]
  lng += 2*B * z * perPixel;
  lat += B * z * perPixel;

  return new google.maps.LatLng(lat, lng);
 }

var MCMapOptions = {
  getTileUrl: function(tile, zoom) {
    var url = config.path;
    if(tile.x < 0 || tile.x >= Math.pow(2, zoom) || tile.y < 0 || tile.y >= Math.pow(2, zoom)) {
      url += '/blank';
    } else if(zoom == 0) {
      url += '/base';
    } else {
      for(var z = zoom - 1; z >= 0; --z) {
        var x = Math.floor(tile.x / Math.pow(2, z)) % 2;
        var y = Math.floor(tile.y / Math.pow(2, z)) % 2;
        url += '/' + (x + 2 * y);
      }
    }
    url = url + '.' + config.fileExt;
    return(url);
  },
  tileSize: new google.maps.Size(config.tileSize, config.tileSize),
  maxZoom:  config.maxZoom,
  minZoom:  0,
  isPng:    !(config.fileExt.match(/^png$/i) == null)
};


function CoordMapType() {
}

function CoordMapType(tileSize) {
  this.tileSize = tileSize;
}

CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var div = ownerDocument.createElement('DIV');
  var html = "(" + coord.x + ", " + coord.y + ", " + zoom + ")"
  + "<br />"
  + MCMapOptions.getTileUrl(coord, zoom);
  
  div.innerHTML = html;
  
  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  div.style.fontSize = '10';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px';
  div.style.borderColor = '#AAAAAA';
  return div;
};

var markerList = Class.extend({
  list: {},
  
  fetchMarkers : function(){},
  
  deleteMarkerByIndex : function(index) {
    this.list[name].delete();
    delete this.list[name];
  },
  
  addMarker : function(name, markerData) {
    if ( this.list[name]) {
      this.deleteMarkerByIndex(name);
    }
    this.list[name] = markerData;
    this.list[name].prepare();
  },
  deleteAll : function() {
    for(name in this.list) {
      this.list[name].delete();
    }
    
    this.list = {};
  }
});

var mapItem = Class.extend({
  itemData : null,
  name : null,
  infoWindow : null,
  latLng : null,
  marker : null,
  animate: false,
  animationDuration : null,
  
  init : function(itemData, latLng) {
    this.itemData = itemData;
    this.latLng = latLng;
  },
  setIcon : function(icon) {
    this.icon = icon;
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
    
    if ( this.animate ) {
      jQuery({wa:This.marker.position.wa, ya:This.marker.position.ya}).animate({wa:position.wa, ya:position.ya}, {
        duration:This.animationDuration,
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
      var marker = new google.maps.Marker({
        position: converted,
        map: map,
        title: item.msg,
        icon: this.icon,
        visible: true,
        zIndex: 999
      });
      
      this.setMarker(marker);
    }
    return this.marker;
  },
  
  getInfoWindowMarkup : function() {
    return '<div class="infoWindow" style="width: 300px"><img src="player-avatar.php?format=flat&s=5&player=' + encodeURIComponent(this.name)  + '&s=8"/><h1>' + this.name + '</h1></div>';

  },
  prepare : function() {
    if ( ! this.infowindow) {
      var This = this;
      var c = this.getInfoWindowMarkup(); 
      this.infowindow = new google.maps.InfoWindow({content: c});
      var marker = this.getMarker();
      
      google.maps.event.addListener(marker, 'click', function() {
        This.infowindow.open(map, marker);
      });
    }
  }
});

