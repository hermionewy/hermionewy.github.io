$(document).ready(function(){

var map = L.map('map').setView([42.32, -71.03], 12);
var geojson;
var sidebar;
var circleLayer = new L.FeatureGroup();
var info = L.control();
var dscp= L.control({position:'bottomright'});
var colorCircle=['#ff2828','#ff00e1','#c65fa6','#796eef','#0054d3','#7b00ff','#2810b2'];
var crimeCatgory = ['Aggravated Assault','Homicide','Robbery','Burglary','Auto Theft','Larceny','Arson'];
var popup = L.popup();

var streetURL = 'https://api.mapbox.com/styles/v1/wuyuyanran/cjgmbd45z00082spmmthhc1bu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid3V5dXlhbnJhbiIsImEiOiJjamN6ODhzczMwb2UyMndxb3lsN3JkZGNwIn0.kBRE1lc7gqCbjF7r2YKhow';
L.tileLayer(streetURL, {
    id: 'mapbox.street',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
}).addTo(map);


function style(feature) {
    return {
        //fillColor: getColor(feature.properties.UnempRatio),
        fillColor:'#555',
        weight: 4,
        opacity: 1,
        color: '#aaa',
        dashArray: '3',
        fillOpacity: 0
    };
}

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
//define a click listener that zooms to the strict
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}



d3.queue()
    .defer(d3.json, 'data/bos_neighborhoods.json')
    .defer(d3.csv, 'data/ViolentAndPropertyCrime2015.csv',parseData)
    .await(function(err, geo, data){
      console.log(data);

    info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#ccc',
        fillOpacity: 0.2
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //layer.bringToFront();
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
        highlightFeature,
        mouseover:highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// method that I will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<h4>Boston Crime Map 2016</h4>' +  (props ?
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


var districts = d3.nest()
    .key(function(d) { return d.district; }).sortKeys(d3.ascending)
    .rollup(function(leaves) { return leaves.length; })
    .entries(data);
var districtOrder=district.sort(function(a, b) {
    return b.value-a.value;
});

//crimeCatgory = [];
data.forEach(function(d){
  if(d.offenseCode=="Aggravated Assault"){
    d.code = 'Aggravated Assault';
  }else if (d.offenseCode=='Homicide'){
    d.code ='Homicide';
  }else if (d.offenseCode=='Robbery'){
    d.code ='Robbery';
  }else if (d.offenseCode=='Residential Burglary' || d.offenseCode== 'Commercial Burglary' || d.offenseCode== 'Other Burglary'){
    d.code='Burglary';
  }else if(d.offenseCode =='Auto Theft'){
    d.code='Auto Theft';
  }else if(d.offenseCode=='Larceny'){
    d.code='Larceny';
  }else if(d.offenseCode=='Arson'){
    d.code='Arson';
  } else(
    d.code ='Others'
  )
});

var sevenCrime = d3.nest()
        .key(function(d){return d.code})
        .entries(data);
console.log(sevenCrime);

// dropdown list
var dropDown=d3.select('select');
var options = dropDown
    .selectAll('option')
    .data(crimeCatgory)
    .enter()
    .append('option')
    .text(function(s){return s;})

    menuChanged();
    dropDown.on('change',menuChanged);

    function menuChanged(){
      var si   = dropDown.property('selectedIndex'),
          s    = options.filter(function (d, i) { return i === si }),
          choice = s.datum();

      map.removeLayer(circleLayer);
      circleLayer = new L.FeatureGroup();
      for (var j=0; j<8; ) {
        if (sevenCrime[j].key==choice){
          console.log(sevenCrime[j]);
            sevenCrime[j].values.forEach(function(d){
             var circles = L.circle(d.location, circleStyle(d.offenseCode)).setRadius(30);
             circleLayer.addLayer(circles);
             circles.bindPopup("Description: "+ d.offenseDes.toLowerCase() + "<br />Time: "+d.date +".");
           });
            map.addLayer(circleLayer);
            return sevenCrime[j].key;
        }else{ j++; }
      }

    }


// Add button to find location
  var button = new L.Control.Button(L.DomUtil.get('helpbutton'), { toggleButton: 'active' });
  button.addTo(map);
  button.on('click',locate);


  var buttonTwo = new L.Control.Button(L.DomUtil.get('buttonExpl'), { toggleButton: 'active' });
  buttonTwo.addTo(map);
  buttonTwo.on('click',function(){
    map.removeLayer(circleLayer);
    geojson = L.geoJson(geo, {
           style: style,
           onEachFeature: onEachFeature
       }).addTo(map);
       map.addLayer(circleLayer);
  });
//var colorCircle=['#61b2f4','#f46161','#ff2828','#db8708','#f79b4a','#dd0000','#fce82f','#81af2b','#cec0c5'];

// append cirles as crime cases
function circleStyle(d){
    if(d=='Aggravated Assault'){
      return{
      color:colorCircle[0],
    };
  }else if (d=='Homicide'){
      return{
      color:colorCircle[1],
    };
  }else if (d=='Robbery'){
      return{
        color:colorCircle[2],
      };
    }else if(d=='Burglary'){
      return{color:colorCircle[3],
      };
    }else if(d=='Auto Theft'){
      return{color:colorCircle[4],
      };
    }else if(d=='Larceny'){
      return{color:colorCircle[5],
      };
    }else if(d=='Arson'){
      return{color:colorCircle[6],
      };
    }
}
//'Aggravated Assault','Homicide','Robbery'，‘Burglary’,'Auto Theft','Larceny','Arson'
// data.forEach(function(d){
//   L.circle(d.location, circleStyle(d.offenseCode)).addTo(map);
// });

var colorBox=L.control({position:'bottomright'});
    colorBox.onAdd=function(map){
      var colorDiv=L.DomUtil.create('div','info legend');
      for(var i=0;i<7;i++){
        colorDiv.innerHTML += '<i style="background:' + colorCircle[i] +'"></i>' + crimeCatgory[i] +'<br>';
      }
      return colorDiv;
    }
colorBox.addTo(map);



});
// INCIDENT NUMBER,OFFENSE CODE,OFFENSE CODE GROUP,OFFENSE DESCRIPTION,DISTRICT,REPORTING AREA,SHOOTING,OCCURRED ON DATE,Hour,YEAR,MONTH,DAY OF WEEK,UCR PART,STREET,LAT,LONG,Location
// I162070944,00520,Residential Burglary,BURGLARY - RESIDENTIAL - FORCE,B3,441,,08/31/2016 05:44:00 PM,17,2016,8,Wednesday,Part One,NIGHTINGALE ST,42.29474312,-71.08503786,"(42.29474312, -71.08503786)"


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
