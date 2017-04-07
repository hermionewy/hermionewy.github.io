console.log('Hubway');
var globalDispatcher = d3.dispatch('update');
var _lineStyle = {
    weight: 0.5,
    opacity: 0.5
}
var _circleStyle ={
    color: '#ED5C8C',
    fillColor: '#f03',
    fillOpacity: 0.1,
    radius: 5
};
var idToLocation = d3.map();//pair the id to location;
var idToName = d3.map();
//Set the map!
    var mapid = 'mapid';
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
        id: 'mapbox.street',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    });

d3.queue()
  .defer(d3.csv,'data/2016hubway-tripdataReduced.csv',parseTrips)
  //.defer(d3.csv,'data/201608-hubway-tripdata.csv',parseTrips)
	//.defer(d3.csv,'data/2016hubway-tripdata.csv',parseTrips)
  .defer(d3.csv,'data/2016station_Data.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
  var Circles = Array.from(stations,function(d){
    d.circle = L.circle(d.latLng,_circleStyle)
           .bindPopup("Station:" + d.name );
           return d.circle;
  });
  var circleGroup = L.layerGroup(Circles);
  var circleGroup2 = L.layerGroup();
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
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);

// take innitial data
function nestDataById (data){
      var tripNestById = d3.nest()
          .key(function(d){return d.bike_nr })
          .entries(data);
      tripNestById.forEach(function(bike){
        bike.utility = d3.sum(bike.values, function(d){ return d.duration})/(3600*24*366);
      });
      return tripNestById;
}

    var tripNestById= nestDataById(trips);
    var cf = crossfilter(tripNestById);
	  var tripsByUtility = cf.dimension(function(d){return d.utility});

    var timeseries = Timeseries();
    var bikeTime = BikeTime();
    d3.select('#plot1').datum(tripsByUtility.top(Infinity))
    			.call(timeseries);

    d3.select('#plot2').datum(tripsByUtility.top(Infinity))
           .call(bikeTime);

    // filter data to weekend
    var cf3 = crossfilter(trips);
    var tripsByWeekend = cf3.dimension (function(d){ return d.startTime;}).filter(function(d){
      return d.getDay()== 6 || d.getDay()==0 ;
    });
    var dataWeekend = nestDataById(tripsByWeekend.top(Infinity));
    //WeekEnd trips
     d3.select('#plot1_2').datum(dataWeekend)
            .call(timeseries);
    // var tripsBySummer = cf3.dimension (function(d){ return d.startTime;}. filter(function(d){
    //   return d.getMonth() == 6 || d.getMonth() == 7 || d.getMonth() == 8 ;
    // }));
    // d3.select('#plot1_3').datum(tripsBySummer.top(Infinity))
    //        .call(timeseries);

    timeseries.on('timerange:select', function(range){
        var arr = tripsByUtility.filter(range).top(Infinity);
        var bikeNum = arr.length;
        console.log(bikeNum);
         d3.select('#plot2').datum(arr)
               .call(bikeTime);
        var bikeid = Array.from(arr,function(d){return d.key});
        var cf2 = crossfilter(trips);
        var tripsById = cf2.dimension(function(d){return d.bike_nr})
            .filter(function(d){
                return bikeid.indexOf(d) > -1;});
      //  console.log(tripsById.top(Infinity));
        var tripsByStation = d3.nest()
            .key(function(d) { return d.startStn; })
            .rollup(function(leaves) { return leaves.length; })
            .entries(tripsById.top(Infinity));

        drawCircles(tripsByStation);

        function drawCircles(stations){
          console.log(stations);
          circleGroup2.clearLayers();
          map.removeLayer(circleGroup2);
          map.addLayer(circleGroup2);

           // for each station append a circle
           var maxY = d3.max(stations, function(d){ return d.value/bikeNum})
          var scaleR = d3.scaleLinear().domain([0,maxY]).range([0,120]);
           var BigCircles = stations.forEach(function(d){
             //console.log(scaleR(+d.value/ bikeNum));
             var circle = L.circle(idToLocation.get(d.key),{   color: '#A5C0D1',fillColor: '#f03',fillOpacity: 0.1, radius: scaleR(+d.value/ bikeNum)})
             .bindPopup("Station:" + idToName.get(d.key)+"<br/>Trips Count Per Bike: "+ (d.value / bikeNum).toFixed(2) );
              circleGroup2.addLayer(circle);
           });
           };
         });
  }


// "","tripduration","starttime","stoptime","start.station.id","start.station.name","start.station.latitude","start.station.longitude","end.station.id","end.station.name","end.station.latitude","end.station.longitude","bikeid","usertype","birth.year","gender"
// "1",835,"2016-03-01 00:01:42","2016-03-01 00:15:38",140,"Danehy Park",42.388966,-71.132788,95,"Cambridge St - at Columbia St / Webster Ave",42.372969,-71.094445,864,"Subscriber","1987",1
function parseTrips(d){
	return {
		bike_nr:d.bikeid,
		duration:+d.tripduration,
		startStn:d.startStn,
    endStn:d.endStn,
		startTime:parseTime(d.starttime),
		endTime:parseTime(d.stoptime)
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
