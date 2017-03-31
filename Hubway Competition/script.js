console.log('Hubway');
var globalDispatcher = d3.dispatch('update');
var idToLocation = d3.map();//pair the id to location;
var _lineStyle = {
    weight: 0.5,
    opacity: 0.5
}
var _circleStyle ={
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.1,
    radius: 10
};

//Set the map!
var mapid = 'mapid';
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
        id: 'mapbox.street',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }),
        satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cj0a8foq000032smczgsyvxdg/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
            id: 'mapbox.street',
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        });

d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
    //Set the map!
    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cizyuiigg00602rs68enzq17p/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
        id: 'mapbox.street',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }),
        satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/hermionewy/cj0a8foq000032smczgsyvxdg/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
            id: 'mapbox.street',
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        });

    var Circles = Array.from(stations,function(d){
      d.circle = L.circle(d.latLng,_circleStyle)
             .bindPopup("Station:" + d.name +"<br/>City: " + d.city );
             return d.circle;
    });
    var circleGroup = L.layerGroup(Circles);
    var lineGroup = L.layerGroup();

    var map = L.map(mapid, {
        center: [42.356, -71.072],
        zoom: 13,
        layers: [streetMap, circleGroup],
        scrollWheelZoom: false
    });

    var baseMaps = {
        "Street": streetMap,
        "Satellite": satelliteMap
    };

    var overlayMaps = {
        "Circles": circleGroup,
        "Lines": lineGroup
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    var timeseries = Timeseries();
    d3.select('#plot1').datum(trips)
    			.call(timeseries);
    timeseries.on('timerange:select', function(data){
        console.log(data); //values
        globalDispatcher.call('update',this,data);
        drawLines(data);
    function drawLines(trips){
        lineGroup.clearLayers();
        map.removeLayer(lineGroup);
        map.addLayer(lineGroup);
        trips.forEach(function(trip){
          var line = L.polyline([idToLocation.get(trip.startStn), idToLocation.get(trip.endStn)], _lineStyle);
          lineGroup.addLayer(line);
        });
    }
    });
}



function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
  idToLocation.set(d.id,[+d.lat,+d.lng]);
	return {
		id:d.id,
		latLng:[+d.lat,+d.lng],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
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


// "","tripduration","starttime","stoptime","start.station.id","start.station.name","start.station.latitude","start.station.longitude","end.station.id","end.station.name","end.station.latitude","end.station.longitude","bikeid","usertype","birth.year","gender"
// "1",835,"2016-03-01 00:01:42","2016-03-01 00:15:38",140,"Danehy Park",42.388966,-71.132788,95,"Cambridge St - at Columbia St / Webster Ave",42.372969,-71.094445,864,"Subscriber","1987",1
