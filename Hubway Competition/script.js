console.log('Hubway');
var globalDispatcher = d3.dispatch('update');
var _lineStyle = {
    color: '#8D99AE',
    weight: 0.5,
    opacity: 0.5
}
var _circleStyle ={
    color: '#F28282',
    //fillColor: '#f03',
    fillOpacity: 0.1,
    radius: 10
};
var idToLocation = d3.map(),//pair the id to location;
    idToDuration = d3.map(),
    idToName = d3.map();

//Set the map!
    var mapid = 'mapid';
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
        id: 'mapbox.street',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    });

d3.queue()
  //.defer(d3.csv, 'data/201608-hubway-tripdata.csv',parseStations)
  .defer(d3.csv,'data/2016hubway-tripdataReduced.csv',parseTrips)
  .defer(d3.json, 'data/bike-duration.json')
  .defer(d3.csv,'data/2016station_Data.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips, bikeDuration, stations){
  var Circles = Array.from(stations,function(d){
    d.circle = L.circle(d.latLng,_circleStyle)
           .bindPopup("Station:" + d.name );
           return d.circle;
  });
  var circleGroup = L.layerGroup(Circles);
  var circleGroup2 = L.layerGroup();
  var lineGroup = L.layerGroup();
  var map = L.map(mapid, {
      center: [42.356, -71.072],
      zoom: 13,
      layers: [streetMap, circleGroup],
      scrollWheelZoom: false
  });

  var baseMaps = {
      "Street": streetMap,
  };

  var overlayMaps = {
      "Circles": circleGroup,
      "Circles2": circleGroup2,
      "Lines":lineGroup
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);
// Draw Timeline
    var trySlider = d3.slider().axis(true).min(1).max(12).step(1).value([3,5]).on('slide',function(evt,value){
      d3.select('#slidertextmin').text(value[ 0 ]);
      d3.select('#slidertextmax').text(value[ 1 ]);
    });
    d3.select('#slider').call(trySlider);


// take innitial data
function nestDataById (data){
      var tripNestById = d3.nest()
          .key(function(d){return d.bikeId })
          .entries(data);
      return tripNestById;
}

    var tripNestById = nestDataById(trips);
    var timeseries = Trends();
    var bikeTrend = BikeTime();
    d3.select('#plot1').datum(bikeDuration)
          .call(timeseries);
  }


// "","tripduration","starttime","stoptime","start.station.id","start.station.name","start.station.latitude","start.station.longitude","end.station.id","end.station.name","end.station.latitude","end.station.longitude","bikeid","usertype","birth.year","gender"
// "1",835,"2016-03-01 00:01:42","2016-03-01 00:15:38",140,"Danehy Park",42.388966,-71.132788,95,"Cambridge St - at Columbia St / Webster Ave",42.372969,-71.094445,864,"Subscriber","1987",1
function parseTrips(d){
	return {
		bikeId:d.bikeid,
		duration:+d.tripduration,
		startStn:d.startStn,
    endStn:d.endStn,
		startTime:parseTime(d.starttime),
		endTime:parseTime(d.stoptime)
	}
}
function parseDuration(d){
  idToDuration.set(d.bikeId,d.duration);
  return {
    bikeId:d.bikeId,
    duration:d.duration
  }
}
// startStationId,startStationName,startStationLongitude,startStationLatitude,sum
// 36,Boston Public Library - 700 Boylston St.,-71.077303,42.349673,13841
function parseStations(d){
  idToLocation.set(d.startStationId,[+d.startStationLatitude, +d.startStationLongitude]);
  idToName.set(d.startStationId,d.startStationName);
	return {
		id:d.startStationId,
    name: d.startStationName,
		latLng:[+d.startStationLatitude,+d.startStationLongitude]
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('-'),
		year = date[0],
		month = date[1],
		day = date[2];

	return new Date(year,month-1,day,hour,min,sec);
}
