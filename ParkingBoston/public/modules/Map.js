function Map(){

  var _circleStyle ={
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.1,
      radius: 5
  };
  var exports = function(selection){
    //Set the map!
    console.log('Set the Map');
    var mapid = 'mapid';
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
        id: 'mapbox.street',
    		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }),
        satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
    		    id: 'mapbox.street',
    				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    		});


    var circles = Array.from(arr,function(d){
      d.circle = L.circle(JSON.parse(d.location),_circleStyle)
             .bindPopup("Description: " + d.description.toLowerCase() + "<br />Time: "+d.time );
             return d.circle;
    })
    var circleGroup = L.layerGroup(circles);

    var map = L.map(mapid, {
        center: [42.356, -71.072],
        zoom: 14.4,
        layers: [streetMap, circleGroup],
    		scrollWheelZoom: false
    });

    var baseMaps = {
        "Street": streetMap,
        "Satellite": satelliteMap
    };

    var overlayMaps = {
        "Circles": circleGroup
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);



    // info box, the whte background
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };


    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<p> Parking Safety in Boston</p>';
    };

    info.addTo(map);

    // Add button to find location
    var button = new L.Control.Button(L.DomUtil.create('button','location'), { toggleButton: 'active' });
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
  return exports;
}
