function animeMap(){
  var W, H, M ={t:30,r:40,b:30,l:40};
  var _lineStyle = {
      color: '#ED5C8C',
      weight: 0.5,
      opacity: 0.5
  }
  var _circleStyle ={
      color: '#ED5C8C',
      fillColor: '#f03',
      fillOpacity: 0.1,
      radius: 5
  };
  var exports = function(selection){
    //Set the map!
    console.log('Set the Map');
    W = W || selection.node().clientWidth - M.l - M.r;
    H = H || selection.node().clientHeight - M.t - M.b;
    var stations = selection.datum();
    var mapid = 'mapid';
    var data = selection.datum()?selection.datum():[];
    var points = data; // data loaded from data.js
    var leafletMap = L.map(mapid, {
        center: [42.356, -71.072],
        zoom: 13,
        layers: [streetMap, circleGroup],
        scrollWheelZoom: false
    });
    L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ")
        .addTo(leafletMap);

    var Circles = Array.from(stations,function(d){
      d.circle = L.circle(d.latLng,_circleStyle)
             .bindPopup("Station:" + d.name );
             return d.circle;
    });
    var circleGroup = L.layerGroup(Circles);
    var circleGroup2 = L.layerGroup();
    var lineGroup = L.layerGroup();
    var baseMaps = {
        "Street": streetMap,
    };

    var overlayMaps = {
        "Circles": circleGroup,
        "Circles2": circleGroup2,
        "Lines":lineGroup
    };

    L.control.layers(baseMaps, overlayMaps).addTo(leafletMap);

}
  return exports;
}
