
//First, append <svg> element and implement the margin convention
var m = {t:50,r:50,b:50,l:50};
var W = document.getElementById('container').clientWidth,
    H = document.getElementById('container').clientHeight;

var plot = d3.select('.plot').append('svg')
    .attr('width',W)
    .attr('height',H)
    .append('g')
    .attr('transform','translate(0,50)');

//Create projection
var projection = d3.geoEquirectangular();

var path = d3.geoPath()
    .projection(projection);

var map;
var colors = {'background':'#2E353D',
  'Chemistry':'rgba(176, 198, 224, .8)',
  'Physics':'rgba(9, 144, 198, .8)',
  'Peace':'rgba(101, 186, 105, .8)',
//  'Economics':'rgba( 252, 147, 27, .8)',
  'Economics':'rgba( 136, 125, 79, .8)',
  'Literature':'rgba(239, 83, 107, .8)',
  'Medicine':'rgba(118, 89, 198, .8)',
  'gold':'rgb(150, 126, 56)'}
var r = 4, button, forceLayout;

forceLayout = ForceLayout()
		      .x(W/2-35)
		      .y(H/2.5)
		      .strength(-4);

var selectedGroupBtn = '',//Where, How , When
    selectedMenu = ''; //SLinvasion,Alwar,Rwgeno,Irwar,Irinsur,Ircivil,MM,Sywar

//Import data and parse
d3.queue()
  .defer(d3.csv,'data/nobelPrizeWinner.csv',parse)
  .defer(d3.json,'data/countries.geo.json')
  .await(dataloaded);

function dataloaded(err, data, mapData) {
  var count = new CountUp("nobelNum", 0, 911, 0, 3);
  count.start();
  var nestByOrg = d3.nest().key(function(d){ return d.org}).entries(data);
  var    orgs= nestByOrg.sort(function(a,b){ return b.values.length-a.values.length}).slice(1,11);
    changeView = Button()
        .map(mapData)
        .menu(orgs);
    plot.datum(data).call(changeView);


}//dataloaded

function getText(txt){
  var re = /\((.*)\)/;
  return txt.match(re)[1]}

function parse(d){
   return {
     year: +d["Year"],
     age: (+d["Year"]-parseTime(d["Birth Date"]).getYear()-1900)?(+d["Year"]-parseTime(d["Birth Date"]).getYear()-1900):'0',
     category: d["Category"],
     motivation: d["Motivation"],
     share: d["Prize Share"],
     name : d["Full Name"],
     birthday: d["Birth Date"]? parseTime(d["Birth Date"]):0,
     birthCity: d["Birth City"]? d["Birth City"]:0,
     birthCtr: d["Birth Country"].includes("(")? getText(d["Birth Country"]):d["Birth Country"],
     sex: d["Sex"]?d["Sex"]:0,
     org: d["Organization Name"]?d["Organization Name"]:'an unknown organization',
     orgCity: d["Organization City"],
     deathDate: parseTime(d["Death Date"])?parseTime(d["Death Date"]):' ',
     deathCtr: d["Death Country"].includes("(")? getText(d["Death Country"]):d["Death Country"]
   };

}

function parseTime(timeStr){
	var	date = timeStr.split('-'),
	year = date[0],
	month = date[1]-1,
	day = date[2];

	return new Date(year,month,day);
}
// Year,Category,Prize,Motivation,Prize Share,Laureate ID,Laureate Type,Full Name,Birth Date,Birth City,Birth Country,Sex,Organization Name,Organization City,Organization Country,Death Date,Death City,Death Country
// 1901,Chemistry,The Nobel Prize in Chemistry 1901,"""in recognition of the extraordinary services he has rendered by the discovery of the laws of chemical dynamics and osmotic pressure in solutions""",1/1,160,Individual,Jacobus Henricus van 't Hoff,1852-08-30,Rotterdam,Netherlands,Male,Berlin University,Berlin,Germany,1911-03-01,Berlin,Germany
