function Map(){
  var _circleStyle ={
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.1,
      radius: 10
  };

  var _dispatcher = d3.dispatch('drawLines');

  var exports = function(selection){
    //Set the map!
    console.log('Set the Map');
    var stations = selection.datum();
    var mapid = 'mapid';

    if(document.getElementById('mapid').classList.contains('leaflet-container')== 'false'){
        var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
            id: 'mapbox.street',
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        }),
            satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cj0a8foq000032smczgsyvxdg/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
                id: 'mapbox.street',
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            });

        var Circles = Array.from(stations,function(d){
          d.circle = L.circle(d.latLng,_circleStyle)
                 .bindPopup("Station:" + d.name +"<br/>City: " + d.city );
                 return d.circle;
        });
        var Group = L.layerGroup(Circles);

        var map = L.map(mapid, {
            center: [42.356, -71.072],
            zoom: 13,
            layers: [streetMap, Group],
            scrollWheelZoom: false
        });

        var baseMaps = {
            "Street": streetMap,
            "Satellite": satelliteMap
        };

        var overlayMaps = {
            "Circles": Group,
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);

    } else{
      //Draw lines if the map exists
        globalDispatcher.on('update', drawLines);
        function drawLines(trips){
          var map = L.map(mapid, {
              center: [42.356, -71.072],
              zoom: 13,
              scrollWheelZoom: false
          });
            trips.forEach(function(trip){
              var location = [idToLocation.get(trip.startStn), idToLocation.get(trip.endStn)];
              var line = L.polyline(location, _lineStyle).addTo(map);
            })
        }
    }

  //   var lines = L.polyline([[42.35328743,-71.04438901], [42.365074,-71.119581]], _lineStyle).addTo(map);
  // }
}

  exports.style = function(_){
    if(!arguments.length) return _circleStyle;
    _circleStyle = _;
    return this;
  }
  exports.on = function(){
    _dispatcher.on.apply(_dispatcher,arguments);
    return this;
  }
  return exports;
}
