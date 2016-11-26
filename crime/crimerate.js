$(document).ready(function(){

var map = L.map('map').setView([42.32, -71.03], 12);
var geojson;
var info = L.control();
var legend = L.control({position: 'bottomright'});
var dscp= L.control({position:'topleft'});
L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/civy9h6dl00272kqrzszngc2t/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
    id: 'mapbox.light',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
}).addTo(map);

function getColor(d) {
    return d > 1.6 ? '#800026' :
           d > 1.4  ? '#BD0026' :
           d > 1.2  ? '#E31A1C' :
           d > 1.0  ? '#FC4E2A' :
           d > 0.8   ? '#FD8D3C' :
           d > 0.6   ? '#FEB24C' :
           d > 0.4   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.UnempRatio),
        weight: 1,
        opacity: 0.8,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
        info.update(layer.feature.properties);
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}
//define a click listener that zooms to the strict
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover:highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

d3.queue()
    .defer(d3.json, 'data/bos_neighborhoods.json')
    .defer(d3.csv, 'data/boston_crime.csv',parseData)
    .await(function(err, geo, data){

      L.geoJson(geo, {style: style}).addTo(map);


  geojson = L.geoJson(geo, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);



    info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<h4>Boston Unemployment Rate</h4>' +  (props ?
        '<b>' + props.Name + '</b><br />' + props.UnempRatio + ' %'
        : 'Click on a district');
};

  info.addTo(map);


  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 0.4,0.6, 0.8, 1.0, 1.2, 1.4, 1.6],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
// Add more DESCRIPTION

  dscp.onAdd = function(map){
    var dscpDiv = L.DomUtil.create('div', 'info legend');
    dscpDiv.innerHTML += 'This map of Boston shows the unemployment rate of Boston area.';
    return dscpDiv;
  }
  dscp.addTo(map);

//filter crime data;
var crime = d3.nest()
        .key(function(d) { return d.district; }).sortKeys(d3.ascending)
        .key(function(d) { return d.offenseCode; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

console.log(crime);
});



function parseData(d){
  if(d['district']!=''){
  return{
    offenseCode: d['OFFENSE CODE GROUP'],
    offenseDes: d['OFFENSE DESCRIPTION'],
    district: d['DISTRICT'],
    date: new Date(d['OCCURRED ON DATE']),
    street: d['STREET'],
    location: [+d['LAT'],+d['LONG']]
  }}
}

})
/*map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);*/
