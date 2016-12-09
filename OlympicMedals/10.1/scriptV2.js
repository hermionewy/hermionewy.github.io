console.log('10.1');

var m = {t:50,r:50,b:50,l:50},
    w = (document.getElementById('canvas').clientWidth - m.l - m.r)*.7,
    h = (document.getElementById('canvas').clientHeight - m.t - m.b)*.7;

var plot = d3.select('.canvas')
    .append('div').attr('class','col-md-9 serif')
    .append('svg')
    .attr('width', 1.3*w + m.l + m.r)
    .attr('height', 1.5*h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');

    var plotTwo = d3.select('.canvas')
        .append('div').attr('class','col-md-9 serif')
        .append('svg')
        .attr('width', w + m.l + m.r)
        .attr('height', h + m.t + m.b)
        .append('g').attr('class','plotTwo')
        .attr('transform','translate('+ m.l+','+ m.t+')');
//Mapping specific functions
//Projection
var projection = d3.geoMercator();

//Geopath
var pathGenerator = d3.geoPath()
      .projection(projection);

//d3.map for data
var rate = d3.map();

var scaleColor = d3.scaleLinear().domain([0,300,2000]).range(['#7ddde8', '#edd465', '#ff2a00']);

var scaleX = d3.scaleTime()
    .domain([0,19])
    .range([0,w]);
var scaleY = d3.scaleLinear()
    .domain([0,4355])
    .range([h,0]);

// Draw Path and Axis
var scaleXP = d3.scaleLinear()
    .domain([1890,2010])
    .range([0,w]);
var scaleYP = d3.scaleLinear()
    .domain([0,420])
    .range([h,0]);

var axisY = d3.axisLeft()
    .scale(scaleYP)
    .tickSize(-w);
var axisX = d3.axisBottom()
    .scale(scaleXP)
    .tickSize(-h);

d3.queue()
    .defer(d3.json, '../data/countries.geo.json')
    .defer(d3.csv, '../data/Summer Olympic medallists 1896 to 2008.csv',parseData)
    .await(function(err, geo, data){
      // Medal data nest
      console.log(data);
      var countries = d3.nest()
          .key(function(d){return d.country})
          .key(function(d){return d.medal})
          .rollup(function(leaves) { return leaves.length; })
          .entries(data);

      console.log(countries);


    })

    function parseData(d){
      return {
          country: d['NOC'],
          edition: d['Edition'],
          discipline: d['Discipline'],
          events: d['Event'],
          medal: d['Medal'],
          sport: d['Sport']
      }
    }
