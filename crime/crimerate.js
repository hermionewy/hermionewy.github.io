$(document).ready(function(){

var map = L.map('map').setView([42.32, -71.03], 12);
var geojson;
var sidebar;
var circleLayer = new L.FeatureGroup();
var info = L.control();
var dscp= L.control({position:'bottomright'});
var colorCircle=['#61b2f4','#f46161','#ff2828','#db8708','#f79b4a'];
var crimeCatgory = ['Assault','Vandalism','Arson','Theft','Burglary'];
L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/civzwvota003e2kqraacncehj/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
    id: 'mapbox.street',
    attribution: ''
}).addTo(map);


function style(feature) {
    return {
        //fillColor: getColor(feature.properties.UnempRatio),
        fillColor:'#eee',
        weight: 1,
        opacity: 0.2,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0
    };
}

function onLocationFound(e) {
    var radius = e.accuracy;

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
//define a click listener that zooms to the strict
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachFeature(feature, layer) {
    layer.on({
        //click: zoomToFeature
    });
}

d3.queue()
    .defer(d3.json, 'data/bos_neighborhoods.json')
    .defer(d3.csv, 'data/boston_crime.csv',parseData)
    .await(function(err, geo, data){
      console.log(geo);


  /*    var geoDistrict={
        'A1':[Downtown],
        'A7': [East Boston],
        'A15':[Charlestown],
        'B2':[Roxbury, Mission],
        'B3':[Mattapan],
        'C6'[South Boston],
        'C11':[Dorchester],
        'D4':[South End, Back Bay, Fenway],
        'D14':[Allston, Brighton],
        'E5':[West Roxbury, Roslindale],
        'E13':[Jamaica Plain],
        'E18':[Hyde Park]
      }*/

 geojson = L.geoJson(geo, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);



    info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
        info.update(layer.feature.properties);
    }
}
//map event
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
        //click: zoomToFeature
    });
}

// method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<h4>Boston Crime Cases in 2016</h4>' +  (props ?
        '<b>' + props.Name + '</b><br />'
        : 'Click on the button to learn more.');
};

  info.addTo(map);

//filter crime data;
var crime = d3.nest()
        .key(function(d) { return d.offenseCode; })
        .key(function(d) { return d.district; }).sortKeys(d3.ascending)
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);
    console.log(crime);

    crime.forEach(function(d){
        d.total=d3.sum(d.values,function(d){return d.value})});
//var neiborhood=['Downtown',];
var district=d3.nest()
        .key(function(d) { return d.district; }).sortKeys(d3.ascending)
        .key(function(d) { return d.offenseCode; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);
    district.forEach(function(d){
        d.total=d3.sum(d.values,function(d){return d.value})});

console.log(district);




var districts = d3.nest()
    .key(function(d) { return d.district; }).sortKeys(d3.ascending)
    .rollup(function(leaves) { return leaves.length; })
    .entries(data);
var districtOrder=district.sort(function(a, b) {
    return b.value-a.value;
});
console.log(districtOrder);

//
data.forEach(function(d){
  if(d.offenseCode=="Simple Assault"|| d.offenseCode=="Aggravated Assault"|| d.offenseCode=="Indecent Assault"){
    d.code = 'Assault';
  }else if (d.offenseCode=='Vandalism'){
    d.code ='Vandalism';
  }else if (d.offenseCode=='Arson'){
    d.code='Arson';
  }else if(d.offenseCode=='Auto Theft'|| d.offenseCode=='Auto Theft Recovery'){
    d.code='Theft';
  }else {
    d.code='Burglary';
}
});
var fiveCrime = d3.nest()
        .key(function(d){return d.code})
        .entries(data);
console.log(fiveCrime);

// dropdown list
var dropDown=d3.select('select')
var options = dropDown
    .selectAll('option')
    .data(crimeCatgory)
    .enter()
    .append('option')
    .text(function(s){return s;})

    dropDown.on('change',menuChanged);
    function menuChanged(){
      var si   = dropDown.property('selectedIndex'),
          s    = options.filter(function (d, i) { return i === si }),
          choice = s.datum();
          console.log(choice);
      map.removeLayer(circleLayer);
      circleLayer = new L.FeatureGroup();
      for (var j=0; j<5; ) {
        if (fiveCrime[j].key==choice){
            fiveCrime[j].values.forEach(function(d){
             var circles = L.circle(d.location, circleStyle(d.offenseCode));
             circleLayer.addLayer(circles);
            })
            map.addLayer(circleLayer);
            return fiveCrime[j].key;
        }else{ j++; }
      }

    }


// Add button to find location
  var button = new L.Control.Button(L.DomUtil.get('helpbutton'), { toggleButton: 'active' });
  button.addTo(map);
  button.on('click',locate);


//var colorCircle=['#61b2f4','#f46161','#ff2828','#db8708','#f79b4a','#dd0000','#fce82f','#81af2b','#cec0c5'];

// append cirles as crime cases

function circleStyle(d){
    if(d=='Simple Assault'|| d=='Aggravated Assault'|| d=='Indecent Assault'){
      return{
      color:colorCircle[0],
      fillColor: colorCircle[0],
      fillOpacity: 0.5,
      radius: 1};
    }else if (d=='Vandalism'){
      return{
      color:colorCircle[1],
      fillColor: colorCircle[1],
      fillOpacity: 0.5,
      radius: 1};
    }else if (d=='Arson'){
      return{
        color:colorCircle[2],
      fillColor: colorCircle[2],
      fillOpacity: 0.5,
      radius: 1};
    }else if(d=='Auto Theft'|| d=='Auto Theft Recovery'){
      return{color:colorCircle[3],
      fillColor: colorCircle[3],
      fillOpacity: 0.5,
      radius: 1};
    }else {
      return{color:colorCircle[4],
      fillColor: colorCircle[4],
      fillOpacity: 0.5,
      radius: 1};
}
}
// data.forEach(function(d){
//   L.circle(d.location, circleStyle(d.offenseCode)).addTo(map);
// });

var colorBox=L.control({position:'bottomright'});
    colorBox.onAdd=function(map){
      var colorDiv=L.DomUtil.create('div','info legend');
      for(var i=0;i<5;i++){
        colorDiv.innerHTML += '<i style="background:' + colorCircle[i] +'"></i>' + crimeCatgory[i] +'<br>';
      }
      return colorDiv;
    }
colorBox.addTo(map);



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
