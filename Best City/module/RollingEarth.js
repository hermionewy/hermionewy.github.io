var margin = {t:50,l:50,b:50,r:50},
    width = document.getElementById('plot1').clientWidth-margin.l-margin.r,
    height = document.getElementById('plot1').clientHeight-margin.t-margin.b;
var sens = 0.25,
  focused,
  worldCenter;

  //Setting projection

  var projection = d3.geoOrthographic()
  .scale(260)
  .rotate([0, 0])
  .translate([2*width / 3, 2*height / 5])
  .clipAngle(90);

  var path = d3.geoPath()
  .projection(projection);

  //SVG container
  var countryList = d3.select("#plot1").append("select").attr("name", "countries");
  var svg = d3.select("#plot1").append("svg")
  .attr("width", width)
  .attr("height", height);

  //Adding water

  svg.append("path")
  .datum({type: "Sphere"})
  .attr("class", "water")
  .attr("d", path);

  var countryTooltip = d3.select("#plot1").append("div").attr("class", "countryTooltip");


  d3.queue()
  .defer(d3.json, "data/countries.geo.json")
  .defer(d3.csv, "data/bestCity.csv", parse)
  .await(ready);


  var explData ={
    "364": { "name":"Iran", "imm":4656},
    "368": { "name":"Iraq", "imm":2874},
    "434": { "name":"Libya", "imm":257},
    "706": { "name":"Somalia", "imm":2265},
    "729": { "name":"Sudan", "imm":250},
    "760": { "name":"Syria", "imm":1515},
    "887": { "name":"Yemen", "imm":143}
  }
  //Main function

  function ready(error, world, data) {

    var allCountry =[];
    world.features.forEach( function(d){
      allCountry.push(d.properties.name);
    });

    var sCountries = d3.nest()
        .key(function(d){ return d.country}).sortKeys(d3.ascending)
        .rollup(function(leaves){
          var cities =[];
          leaves.forEach(function(d){
            cities.push(d.city);
          })
          return {
          'cities': cities,
          'num':leaves.length }
        })
        .entries(data);

    //Adding countries to select

    sCountries.forEach(function(d) {
      option = countryList.append("option");
      option.text(d.key);
      option.property("value", d.key);
    });



    //Drawing countries on the globe

    var map = svg.selectAll("path.land")
    .data(world.features)
    .enter().append("path")
    .attr("class", "land")
    .attr("d", path)
    .call(
      d3.drag()
      .subject(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
      .on("drag", function() {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll(".focused").classed("focused", focused = false);
      })
    );

    //Country focus on option select

    d3.select("select").on("change", function() {
      var option = this.value;
      var rotate = projection.rotate();
      var focusedCountry = getCenter(world, this);
      console.log();
      worldCenter = d3.geoCentroid(focusedCountry);

      svg.selectAll(".focused").classed("focused", focused = false);

      d3.transition()
      .duration(2500)
      .tween("rotate", function() {
        var r = d3.geoInterpolate(projection.rotate(), [-worldCenter[0],-worldCenter[1]]);
        return function(t) {
          projection.rotate(r(t));
          svg.selectAll("path.land").attr("d", path)
          .classed("focused", function(d, i) { return (d.properties.name.replace(/\s+/g, '') == option.replace(/\s+/g, '')) ? true : false; });
        };
      });

      d3.select('.expl')
        .html("<span class='expl_cnt'>" +  getInfo(sCountries, option)[0] + "</span>"+ " city/cities in " + "<span class='expl_number'>"
        + option + "</span>"+ " is/are selected as one of the 177 best international cities providing citizens with quality life. <br/><hr/>Selected City: "+
        getInfo(sCountries, option)[1]);

    });



    function getCenter(worldJson, s) {
      var center=[];
      worldJson.features.forEach(
        function(d){
          if(d.properties.name.replace(/\s+/g, '') == s.value.replace(/\s+/g, '')){
            center = d.geometry;
            console.log(d.properties.name);
            console.log(s.value);
          }
        }
      )
     return center;
    };


    function getInfo(arr, c) {
      var info=[];
      arr.forEach(
        function(d){
          if ((d.key).replace(/\s+/g, '') == c.replace(/\s+/g, '') ){
            info.push(d.value.num);
            info.push(d.value.cities);
          }
        }
      );
      return info;
    }


  };
  function parse(d){
   return {
     city:d['City'],
     country: d['Country'],
     extraInfo: d['Extra Info'],
     all: d['Quality of Life Index'],
     purchase: d['Purchasing Power Index'],
     safety: d['Safety Index'],
     health: d['Health Care Index'],
     cost: d['Cost of Living Index'],
     property: d['Property Price to Income Ratio'],
     traffic: d['Traffic Commute Time Index'],
     pollution: d['Pollution Index'],
     climate: d['Climate Index']
   }
  }
