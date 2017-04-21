console.log('Hubway');
var globalDispatcher = d3.dispatch('update');
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

var bikeIcon = L.icon({
    iconUrl: 'lib/marker-bike-green-shadowed.png',
    iconSize: [25, 39],
    iconAnchor: [12, 39],
    shadowUrl: null
});

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
   document.getElementById('loading').remove();
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
    //
    var range = [2.5, 3.5];
    var rangeUpdate = [range[0]*3600*366,range[1]*3600*366]; //range: duration seconds
    var cfBikeDuration = crossfilter(bikeDuration);
    var selectedBike = cfBikeDuration.dimension(function(d){ return d.duration }).filter(rangeUpdate).top(Infinity);
    //filter and show

    function getSelectedBikeTrips(selectedBike){
        var selectedBikeId = Array.from(selectedBike,function(d){return d.bikeId});
        var cf = crossfilter(tripNestById);
        var selectedBikeTrips = cf.dimension(function(d){return d.key})
            .filter(function(d){
                return selectedBikeId.indexOf(d) > -1 });
              return selectedBikeTrips.top(Infinity);}

    var selectedBTrips = getSelectedBikeTrips(selectedBike);
    d3.select('#plot2').datum(selectedBTrips)
           .call(bikeTrend);//{key:value}

    var info = d3.select('#info2').select('p')
      .append('text');
    var info3 = d3.select('#info3').select('p')
      .append('text');

    timeseries.on('timerange:select', function(range){
        var rangeUpdate = [range[0]*3600*366,range[1]*3600*366]; //range: duration seconds
        var cf2 = crossfilter(bikeDuration);
        var selectedBike = cf2.dimension(function(d){ return d.duration }).filter(rangeUpdate).top(Infinity);
        //filter and show
        console.log(selectedBike);
        var bikeNum = selectedBike.length;

          info.text('There are '+ bikeNum +' Hubway bikes working between'+ range[0].toFixed(2)+' and '+ range[1].toFixed(2) +' hours per day in 2016. Their weekly preformance are shown below. Click on the circle to see where it started.');

        var selectedBTrips = getSelectedBikeTrips(selectedBike);
        console.log(selectedBTrips);

        d3.select('#plot2').datum(selectedBTrips)
               .call(bikeTrend);

         });

    bikeTrend.on('selectBike', function(d){
      info3.text('Bike ID '+ d[0].bikeId +' had been used '+ d.length+' times in 2016. All the trips it had taken are shown in the map.');
        circleGroup2.clearLayers();
        drawLines(d);
        function drawLines(trips){
            lineGroup.clearLayers();
            map.removeLayer(lineGroup);
            map.addLayer(lineGroup);
            trips.forEach(function(trip){
              var line = L.polyline([idToLocation.get(trip.startStn), idToLocation.get(trip.endStn)], _lineStyle);
              lineGroup.addLayer(line);
            });
        }
        drawCircles(d);

        function drawCircles(trips){
            var stations= d3.nest().key(function(d){ return d.startStn }).rollup(function(leaves) { return leaves.length; }).entries(trips);
            circleGroup2.clearLayers();
            map.removeLayer(circleGroup2);
            map.addLayer(circleGroup2);

         // for each station append a circle
            var maxY = d3.max(stations, function(d){ return d.value})
            var scaleR = d3.scaleLinear().domain([0,maxY]).range([0,400]);
            var BigCircles = stations.forEach(function(d){
            var latLng = (idToLocation.get(d.key))? (idToLocation.get(d.key)):([0,0]);
            var circle = L.circle(latLng,{color: '#A5C0D1',fillColor: '#f03',fillOpacity: 0.1, radius: scaleR(+d.value)})
                .bindPopup("Station:" + idToName.get(d.key)+"<br/>Start Trips Count in 2016: "+ d.value );
            circleGroup2.addLayer(circle);
         });
         };

    });
  }


// "","tripduration","starttime","stoptime","start.station.id","start.station.name","start.station.latitude","start.station.longitude","end.station.id","end.station.name","end.station.latitude","end.station.longitude","bikeid","usertype","birth.year","gender"
// "1",835,"2016-03-01 00:01:42","2016-03-01 00:15:38",140,"Danehy Park",42.388966,-71.132788,95,"Cambridge St - at Columbia St / Webster Ave",42.372969,-71.094445,864,"Subscriber","1987",1
function parseTrips(d){
	return {
		bikeId:d.bikeid,
		duration:+d.tripduration,
		startStn:d.startStn,
    endStn:d.endStn,
		startTime:parseTime(d.starttime)
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
