$(document).ready(function(){
// Got the data!
var theftUrl = 'https://data.cityofboston.gov/resource/29yf-ye7n.json?offense_code_group=Auto Theft&$limit=10000';
//var larcenyUrl = 'https://data.cityofboston.gov/resource/29yf-ye7n.json?offense_code_group=Larceny From Motor Vehicle&$limit=10000';
var MVAccUrl = 'https://data.cityofboston.gov/resource/29yf-ye7n.json?offense_code_group=Motor Vehicle Accident Response&$limit=50000';
var theftData, theftDataClone, larcenyData, MVAccData;
var crimeCatgory=['All','Auto Theft', 'Larceny from MV', 'MV Accident'];

var mapText = 'Hello!';


//Creating dropdown menus
var selectMenu = d3.select('#dropDown');
var options = selectMenu
		.selectAll('option')
		.data(crimeCatgory)
		.enter()
		.append('option')
		.text(function(s){return s;});
selectMenu.on('change',menuChanged);

function menuChanged(){
    var si   = selectMenu.property('selectedIndex');
		console.log(si);
		/*if (si ==1){
			d3.json(theftUrl, function (data) {
			     // An array of objects
					d3.selectAll('.plot').html('');
					theftData = data.map(parseJson);
					d3.select('#mapid').datum(theftData).call(MapA);
					var cf = crossfilter(theftData);
			 		var theftDataByTime = cf.dimension(function(d){return d.time});

			 		var timeseries= Timeseries();
					d3.select('#plot2').datum(theftDataByTime.top(Infinity)).call(timeseries);

			 		var CaseHour= CasesByHour().interval(1/2);
					d3.select('#plot3').datum(theftData).call(CaseHour);
			 		var num = theftData.length;
			 		document.getElementById('mapText').innerHTML = '<p style="font-size:12px">There are <span>'+num+'</span> auto theft incidents happened in Boston from June 7,2016 up to now.<br/><br/> Auto theft is the criminal act of stealing or attempting to steal a car (or any other motor vehicle).</p>';

			});
		}*/
}
// d3.queue()
// 	.defer(null,d3.json(theftUrl, function (data) { var theftData = data.map(parseJson); return theftData}))
// 	.defer(null,d3.json(larcenyUrl, function (data) { var larcenyData = data.map(parseJson); return larcenyData}))
// 	.await(function(err, theft, larceny){console.log(theft)});


d3.json(MVAccUrl, function (data) {
     // An array of objects
		 var MapA=Map();
		 MVAccData = data.map(parseJson);
		 //console.log(MVAccData[0].time.getYear());
		d3.select('#mapid').datum(MVAccData).call(MapA);
		var cf = crossfilter(MVAccData);
 		var MVAccDataByTime = cf.dimension(function(d){return d.time});
 		//var timeseries= Timeseries().domain(d3.extent(MVAccData,function(d){ return d.time}));
		//d3.select('#plot2').datum(MVAccDataByTime.top(Infinity)).call(timeseries);
 		var num = MVAccData.length;
		var num2017= MVAccData.filter(function(d){ return d.time.getYear()==117}).length;
 		document.getElementById('mapText').innerHTML = '<p><span style="font-size: 25px">'+num2017+'</span><br/><strong>MV accidents in 2017</strong></p><hr/>'+'<p style="font-size:14px">The map shows the <span>'+num+'</span> MV accidents took place in Boston since August 12, 2015.<br/><br/>From 2013 to 2016, the numbers of MV accidents records are 4662, 4605, 9301, 11531, according to the report released by Boston Police Department.<br/><br/>Click the "Your Location" button on the Map to see the accidents happened near you or change the basemap to see them on the satellite view. </p>';
});

d3.csv('data/BPD_MVAcc2013~2016.csv', function(data) {
   var dataset = data.map(parseCSV);
	 var cf = crossfilter(dataset);
	 var MVAccDataByTime = cf.dimension(function(d){return d.time});
	 var timeseries= Timeseries().domain(d3.extent(dataset,function(d){ return d.time}));
	 var num=[];
	 for (var i=0; i<4; i++){
		 num[i]=dataset.filter(function(d){ return d.time.getYear()==(113+i)}).length;
	 }
	 console.log(num);
   d3.select('#plot2').datum(MVAccDataByTime.top(Infinity)).call(timeseries);
	 document.getElementById('plot2_1').innerHTML = '<hr/><p><span>MISTERY</span><br/><br/>There is a significant rise on motor vehicle accident numbers started on June 16. There are <span>48</span> MV accident records on that single day.<br/> <br/>The Boston Police Department changed to a new system later on August 12 when there were <span>22</span> accidents took place on that day, and then the numbers of the accident records come back to normal with a rise on average. </p>';
//Bar Chart
	 var CaseDay=CasesByWeekDay();
	 d3.select('#plot3_0').datum(dataset).call(CaseDay);
// radial histogram
	 var CaseHour= CasesByHour().interval(1/4);
	 d3.select('#plot3').datum(dataset).call(CaseHour);
	 document.getElementById('plot3_1').innerHTML = '<hr/><p><span>History Patterns</span><br/><br/>The bar chart shows that more MV accidents happened on <span>Friday</span> than other days of week, while fewer accidents took place on Sunday. <br/><br/>The graphic on the right shows the frequency of MV accidents happened in 24 hours based on the data from 2012 to 2016. <br/><br/>There are more accidents happend between <span>3:00p.m~7:00p.m</span> than other time although with a lot of incidents were recorded to happen on midnight.</p>';

	});

//Set the svg!
var m = {t:50,r:50,b:50,l:50},
	w = d3.select('#plot2').node().clientWidth - m.l - m.r,
	h = d3.select('#plot2').node().clientHeight - m.t - m.b;



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
function parseCSV(d){
	return {
		id:d['INCIDENT NUMBER'],
		offenseCode:d['CRIMETYPE_Revised'],
		district:d['DISTRICT'],
		street:d['STREET'],
	  description:d['OFFENSE DESCRIPTION'],
		time: parseCsvTime(d['OCCURRED ON DATE'])
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

function parseCsvTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1];

	var	date = timeStr.split(' ')[0].split('/'),
		year = +date[2]+2000,
		month = +date[0],
		day = +date[1];

	return new Date(year,month-1,day,hour,min);
}
})
