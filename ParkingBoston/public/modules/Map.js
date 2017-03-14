function Map(){

  var _circleStyle ={
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.1,
      radius: 5
  };
  var _circleStyle2={
  		color: 'blue',
  		fillColor: '#30f',
  		fillOpacity: 0.1,
  		radius: 5
  };
  //var _dispatcher = d3.dispatch('larceny:on','mvaccident:on');
  var exports = function(selection){
    //Set the map!
    console.log('Set the Map');
    var arr = selection.datum();
    var mapid = 'mapid';
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
        id: 'mapbox.street',
    		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }),
        satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
    		    id: 'mapbox.street',
    				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    		});


    var theftCircles = Array.from(arr,function(d){
      d.circle = L.circle(JSON.parse(d.location),_circleStyle)
             .bindPopup("Street:" + d.street+"<br/>Description: " + d.description.toLowerCase() + "<br/>Time: "+d.time  );
             return d.circle;
    })
    var theftGroup = L.layerGroup(theftCircles);

    var map = L.map(mapid, {
        center: [42.356, -71.072],
        zoom: 13.3,
        layers: [streetMap, theftGroup],
    		scrollWheelZoom: false
    });

    var baseMaps = {
        "Street": streetMap,
        "Satellite": satelliteMap
    };

    var overlayMaps = {
        "Circles": theftGroup,
//        "Larceny": larcenyGroup,
//        "MV Accident":mvAccidentGroup
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);


    // Add button to find location
    var button = new L.Control.Button(L.DomUtil.get('locButton'), { toggleButton: 'active' });
    button.addTo(map);
    button.on('click',locate);

    function onLocationFound(e) {
    var radius = 100;
    L.marker(e.latlng).addTo(map)
        .bindPopup("Within " + radius + " meters from your location.").openPopup();
    L.circle(e.latlng, radius).addTo(map);
}
    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationerror', onLocationError);
    map.on('locationfound', onLocationFound);
    function locate(){
      map.locate({setView: true, maxZoom: 16});
    }


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
