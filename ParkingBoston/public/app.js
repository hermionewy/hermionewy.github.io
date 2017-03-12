$(document).ready(function(){
// Got the data!
var theftUrl = 'https://data.cityofboston.gov/resource/29yf-ye7n.json?offense_code_group=Auto Theft&$limit=10000';
var larcenyUrl = 'https://data.cityofboston.gov/resource/29yf-ye7n.json?offense_code_group=Larceny From Motor Vehicle&$limit=10000';
var MVAccUrl = 'https://data.cityofboston.gov/resource/29yf-ye7n.json?offense_code_group=Motor Vehicle Accident Response&$limit=10000';
var theftData, theftDataClone, larcenyData, MVAccData;
var crimeCatgory=['All','Auto Theft', 'Larceny from MV', 'MV Accident'];
var circleStyle2={
		color: 'blue',
		fillColor: '#30f',
		fillOpacity: 0.1,
		radius: 5
};
var mapText = 'Hello!';
var MapA=Map();
var MapA=Map().style(circleStyle2);
// var CasesHour=CasesByHour();
var dispatcher = d3.dispatch('theftdata:on','larcenydata:on');
var index = 1;

d3.json(theftUrl, function (data) {
     // An array of objects

		theftData = data.map(parseJson);
		//console.log(theftData);
		var cf = crossfilter(theftData);
		var theftDataByTime = cf.dimension(function(d){return d.time});
		var timeseriesFocus = Timeseries();
		//var CaseHour= CasesByHour().interval(1/2);
		var num = theftData.length;
		//d3.select('#mapid').datum(theftData).call(MapA);
		//d3.select('#plot2').datum(theftDataByTime.top(Infinity)).call(timeseriesFocus);
    //d3.select('#plot3').datum(theftData).call(CasesHour);
		document.getElementById('mapText').innerHTML = '<p style="font-size:12px">There are <span>'+num+'</span> auto theft incidents happened in Boston from June 7,2016 up to now.<br/><br/> Auto theft is the criminal act of stealing or attempting to steal a car (or any other motor vehicle).</p>';
		dispatcher.call('theftdata:on', this, theftData);

});

d3.json(larcenyUrl, function (data) {
     // An array of objects

		larcenyData = data.map(parseJson);
		//dispatcher.call('larcenydata:on', this, larcenyData);
		//d3.select('#plot3').datum(larcenyData).call(CasesHour);
		//d3.select('#mapid').datum(larcenyData).call(MapA);
});

d3.json(MVAccUrl, function (data) {
     // An array of objects
		//  var CasesHour=CasesByHour().interval(1/4);
		//  MVAccData= data.map(parseJson);
		// d3.select('#plot4').datum(MVAccData).call(CasesHour);
});

//Set the svg!
var m = {t:50,r:50,b:50,l:50},
	w = d3.select('#plot2').node().clientWidth - m.l - m.r,
	h = d3.select('#plot2').node().clientHeight - m.t - m.b;

//Creating dropdown menus
var selectMenu = d3.select('#dropDown');
var options = selectMenu
		.selectAll('option')
		.data(crimeCatgory)
		.enter()
		.append('option')
		.text(function(s){return s;});
selectMenu.on('change',menuChanged);


// svgs.each(function(d,i){
// 	dispatch.on('mouse:move.'+i, function(xy){
// 		//console.log(xy);
// 		d3.select(this).select('.pointer')
// 		.attr('cx',xy[0])
// 		.attr('cy',xy[1]);
// 	})
// });
	dispatcher.on('theftdata:on', function(d){
		console.log(d);
			d3.select('#mapid').datum(d).call(MapA);
	});

function menuChanged(){
    var si   = selectMenu.property('selectedIndex');
		if(si==2){
			dispatcher.on('theftdata:on', function(d){
				console.log(d);
					d3.select('#mapid').datum(d).call(MapB);
			});

		}
}


var selectYear = d3.select('#yearOptions');
var year = selectYear
		.selectAll('option')
		.data([2016,2017])
		.enter()
		.append('option')
		.text(function(s){return s;});


function parseJson(d){
	return {
		id:d.incident_number,
		offenseCode:d.offense_code_group,
		district:d.district,
		street:d.street,
	  description:d.offense_description,
		time:parseTime(d.occurred_on_date),
		location: d.location.coordinates?('['+d.location.coordinates[1]+','+d.location.coordinates[0]+']'):[0,0]
	}
}


function parseTime(timeStr){
	var time = timeStr.split('T')[1].split(':'),
	hour = +time[0],
	min = +time[1],
	sec = +time[2];

	var	date = timeStr.split('T')[0].split('-'),
	year = date[0],
	month = date[1]-1,
	day = date[2];

	return new Date(year,month,day,hour,min,sec);
}

})
