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
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy0/cj8zu49k3j8du2ro243yljqvs/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eTAiLCJhIjoiY2o4enR3NTBkMnQzbjMybzRnN3RyMm54NiJ9.LRK0M9BkcWGXQeMfR69HDA', {
        id: 'mapbox.street',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    });
var Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
  var cfTrips = crossfilter(trips);
// take innitial data
function nestDataById (data){
      var tripNestById = d3.nest()
          .key(function(d){return d.bikeId })
          .rollup(function(d){ return d.duration})
          .entries(data);
      return tripNestById;
}
    var tripNestById = nestDataById(trips);
    var timeseries = Trends();

    var allDuration = Array.from(bikeDuration, function(d){return{
      'key':d.bikeId,
      'value':d.duration
    }});
    d3.select('#plot1').datum(allDuration)
          .call(timeseries);

    var tripsBySummer = cfTrips.dimension (function(d){ return d.startTime;}).filter(function(d){
      return d.getMonth() == 4 || d.getMonth() == 5 || d.getMonth()==6 || d.getMonth()==7;
    });
    var Data = d3.nest().key(function(d){return d.bikeId})
        .rollup(function(d){ return d3.sum(d, function(d){ return d.duration})})
        .entries(tripsBySummer.top(Infinity));
    var springtime = Trends().interval(3600*123).brushable(false);
    d3.select('#plot2').datum(Data)
            .call(springtime);
    // // filter data to weekend
    // var cf3 = crossfilter(trips);
    // var tripsByWeekend = cf3.dimension (function(d){ return d.startTime;}).filter(function(d){
    //   return d.getDay()== 6 || d.getDay()==0 ;
    // });
    // var dataWeekend = nestDataById(tripsByWeekend.top(Infinity));
    // //WeekEnd trips
    //  d3.select('#plot2').datum(dataWeekend)
    //         .call(timeseries);

    // d3.select('#plot2').datum(summerData)
    //        .call(summertime);

    //Slider
    var slider = timeSlider();

    d3.select('#slider').call(slider);

    slider.on('timeline', function(range){
      document.getElementById('slidertextmin').innerHTML = Months[range[0].getMonth()];
      document.getElementById('slidertextmax').innerHTML = Months[range[1].getMonth()];
      globalDispatcher.call('update', this, range);
    });

    globalDispatcher.on('update', function(f){
      var monthTrends= Trends().interval(3600*60).brushable(false);
      var cfSlider = crossfilter(trips);
      d3.select('#plot2').datum(
        d3.nest().key(function(d){return d.bikeId})
            .rollup(function(d){ return d3.sum(d, function(d){ return d.duration})})
            .entries(
              cfSlider.dimension(function(d){ return d.startTime;}).filter(function(d){
                return d.getMonth()>=f[0].getMonth() && d.getMonth()<f[1].getMonth();
              }).top(Infinity) )).call(monthTrends);
    });
    function getSelectedBikeTrips(selectedBike){
        var selectedBikeId = Array.from(selectedBike,function(d){return d.bikeId});
        var cf = crossfilter(trips);
        var selectedBikeTrips = cf.dimension(function(d){return d.bikeId})
            .filter(function(d){
                return selectedBikeId.indexOf(d) > -1 });
              return selectedBikeTrips.top(Infinity); }

      function nestStation(sBTrips){
        var tripsByStation = d3.nest()
            .key(function(d) { return d.startStn; })
            .rollup(function(d) { return d.length; })
            .entries(sBTrips);
            return tripsByStation;
      }
    var info = d3.select('#info2').select('p')
      .attr('class','info')
      .append('text');
    timeseries.on('timerange:select', function(range){
        var rangeUpdate = [range[0]*3600*366,range[1]*3600*366]; //range: duration seconds
        var cf2 = crossfilter(bikeDuration);
        var selectedBike = cf2.dimension(function(d){ return d.duration }).filter(rangeUpdate).top(Infinity);
        var selectedBTrips = getSelectedBikeTrips(selectedBike);
        var bikeNum = selectedBike.length;
          info.text('There are '+ bikeNum +' Hubway bikes working <span>'+ range[0].toFixed(2)+' ~ '+ range[1].toFixed(2) +'</span> hours per day in 2016.');
        var tripsByStation = nestStation(selectedBTrips);

        drawCircles(tripsByStation);

      function drawCircles(stations){
        circleGroup2.clearLayers();
        map.removeLayer(circleGroup2);
        map.addLayer(circleGroup2);

         // for each station append a circle
         var maxY = d3.max(stations, function(d){ return d.value})
        var scaleR = d3.scaleLinear().domain([0,maxY]).range([0,600]);
         var BigCircles = stations.forEach(function(d){
           var latLng = (idToLocation.get(d.key))? (idToLocation.get(d.key)):([0,0]);
           var circle = L.circle(latLng,{color: '#A5C0D1',fillColor: '#f03',fillOpacity: 0.1, radius: scaleR(+d.value)})
           .bindPopup("Station:" + idToName.get(d.key)+"<br/>"+ d.value+"trips of selected bikes start from here. " );
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
    key:d.bikeId,
    value:d.duration
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
