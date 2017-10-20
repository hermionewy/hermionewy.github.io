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
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy0/cj8zu6n7bj8fz2ro2cxso3j42/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eTAiLCJhIjoiY2o4enR3NTBkMnQzbjMybzRnN3RyMm54NiJ9.LRK0M9BkcWGXQeMfR69HDA', {
        id: 'mapbox.street',
    		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }),
        satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy0/cj8zu94yz10z92rqnofw25kvl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eTAiLCJhIjoiY2o4enR3NTBkMnQzbjMybzRnN3RyMm54NiJ9.LRK0M9BkcWGXQeMfR69HDA', {
    		    id: 'mapbox.street',
    				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    		});


    var theftCircles = Array.from(arr,function(d){
      d.circle = L.circle(JSON.parse(d.location),_circleStyle)
             .bindPopup("Street:" + d.street+"<br/>Description: " + d.description.toLowerCase() + "<br/>Time: "+d.time  );
             return d.circle;
    })
    var theftGroup = L.layerGroup(theftCircles);
    var circleGroup2 = L.layerGroup();
    var map = L.map(mapid, {
        center: [42.356, -71.072],
        zoom: 13,
        layers: [streetMap, theftGroup],
    		scrollWheelZoom: false
    });

    var baseMaps = {
        "Street": streetMap,
        "Satellite": satelliteMap
    };

    var overlayMaps = {
        "Circles": theftGroup,
        "Circles2": circleGroup2,
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
    function drawCircles(stations){
        // circleGroup2.clearLayers();
        // map.removeLayer(circleGroup2);
        // map.addLayer(circleGroup2);
        //
        //  // for each station append a circle
        //  var maxY = d3.max(stations, function(d){ return d.value})
        // var scaleR = d3.scaleLinear().domain([0,maxY]).range([0,600]);
        //  var BigCircles = stations.forEach(function(d){
        //    var latLng = (idToLocation.get(d.key))? (idToLocation.get(d.key)):([0,0]);
        //    var circle = L.circle(latLng,{color: '#A5C0D1',fillColor: '#f03',fillOpacity: 0.1, radius: scaleR(+d.value)})
        //    .bindPopup("Station:" + idToName.get(d.key)+"<br/>"+ d.value+"trips of selected bikes start from here. " );
        //     circleGroup2.addLayer(circle);
        //  });
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
