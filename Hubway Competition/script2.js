//Set up a drawing environment
d3.queue()
	.defer(d3.csv,'./data/hubway03to09.csv',parseTrips)
	.defer(d3.csv,'./data/hubway10to12.csv',parseTrips)
	//.defer(d3.csv,'./data/hubway03.csv', parseTrips)
	.defer(d3.csv,'./data/Hubway_Stations_2011_2016.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips1,trips2,stations){
		trips = trips2.reduce( function(coll,item){
    coll.push( item );
    return coll;
}, trips1 );
 		console.log(trips1.length);
		//
		// //Time series module
		 var timeseries = Timeseries();
		 d3.select('#plot1').datum(trips)
		 	 .call(timeseries);

}
// tripduration,starttime,stoptime,start station id,start station name,start station latitude,start station longitude,end station id,end station name,end station latitude,end station longitude,bikeid,usertype,birth year,gender
// 835,3/1/16 0:01,3/1/16 0:15,140,Danehy Park,42.388966,-71.132788,95,Cambridge St - at Columbia St / Webster Ave,42.372969,-71.094445,864,Subscriber,1987,1

// tripduration,starttime,stoptime,start station id,start station name,start station latitude,start station longitude,end station id,end station name,end station latitude,end station longitude,bikeid,usertype,birth year,gender
// 623,10/1/16 0:02,10/1/16 0:13,189,Kendall T,42.36242784,-71.08495474,53,Beacon St / Mass Ave,42.350851,-71.089886,57,Subscriber,1993,2

function parseTrips(d){
	return {
		bikeId:d.bikeid,
		duration:+d.tripduration,
		startTime:parseTime(d.starttime),
		endTime:parseTime(d.stoptime),
		startStn:d['start station id'],
		endStn:d['end station id'],
		userType:d.usertype,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d['birth year']?+d['birth year']:undefined
	}
}

function parseStations(d){
	return {
		id:d['Station ID'],
		lngLat:[+d.Longitude,+d.Latitude],
		city:d['Municipality'],
		name:d['Station'],
		docks:d['# of Docks']
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1];

	var	date = timeStr.split(' ')[0].split('/'),
		year = +date[2]+2000,
		month = +date[0],
		day = +date[1];

	return new Date(year,month-1,day,hour,min);
}
