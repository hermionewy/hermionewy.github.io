/**
 * Created by YanWu on 05/07/17.
 */

var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var projection,path,mapData;
var dataMapping;

d3.queue()
  .defer(d3.csv,'data/BirthRegion06to15.csv',parseRegions)
  //.defer(d3.csv,'data/AdmissionfType06to15.csv',parseTypes)
  .defer(d3.json, 'data/countries.geo.json')
  .defer(d3.json, 'data/gz_2010_us_040_00_5m.json')
  .defer(d3.csv, 'data/residentState06to15.csv')
	.await(dataLoaded);

function dataLoaded(err,regions, countries, states,statesPop){
  var newRegions = [].concat.apply([], regions);
  dataMapping = d3.map(countries.features,function(d){return d.properties.name});

  var worldMap = Map().projection(d3.geoMercator());
  plot.datum(countries).call(worldMap);

  plot.on('click',function(){
    dataMapping = d3.map(states.features, function(d){ return d.properties.name});
    var worldMap = Map().projection(d3.geoAlbersUsa()).scaleP(1200);
    plot.datum(states).call(worldMap);
  });

  var xMap = function(d){
    if (dataMapping.get(d.country)) {
        return path.centroid(dataMapping.get(d.country).geometry)[0];
       }
        return -100;
       }

  var yMap = function(d){
        if (dataMapping.get(d.country)) {
            return path.centroid(dataMapping.get(d.country).geometry)[1];
        } else {
            return 600  ;
        }
    }
//  var maxNum= d3.max(newRegions, function(d){ return d.num})
  var scaleR = d3.scaleLinear().domain([0,10000]).range([0,6]);


var nodes =  plot.append('g')
      .attr('class','.nodes');
var circles = nodes
      .selectAll('.circle')
      .data(newRegions);
    circles
      .enter()
      .append('circle')
      .attr('class','circle')
      .attr('cx', function (d) { return +xMap(d); })
      .attr('cy', function (d) { return +yMap(d); })
      .attr('r', function (d) { return +scaleR(d.num); })
      .style('fill', 'red')
      .style('opacity',.6);


  var forceCollide = d3.forceCollide()
    .radius(function(d){return scaleR(d.num)});
  var charge = d3.forceManyBody().strength(0);
  var forceX = d3.forceX().x(xMap),
      forceY = d3.forceY().y(yMap);
  var forceCustom = function(){
    var nodes;
    function force(alpha){
        //a custom force function that tries to separate nodes by their color
        var node, center;
        for(var i = 0, k = alpha*.12; i < nodes.length; i++){
            node = nodes[i];
            center = [xMap(node),yMap(node)];
            node.vx += (center[0] - node.x)*k;
            node.vy += (center[1] - node.y)*k;
        }
    }
    force.initialize = function(_){
        nodes = _;
    }

    return force;
  };

  var forceSimulation = d3.forceSimulation(newRegions)
          // .force('forceX',forceX)
          // .force('forceY',forceY)
          .force('charge',charge)
          .force('collide',forceCollide)
          .force('custom',forceCustom())
          .on('tick',forceTick)
          .on('end',function(){
                console.log('simulation end');
          });
  function forceTick(){
    nodes.selectAll('.circle')
        .attr('cx',function(d){return d.x})
        .attr('cy',function(d){return d.y});
  }



}

function parseRegions(d){
  var parseData=[];
  var concatData=[];
  function newData(num){  //d['2015']
    if(num <10000){
      parseData.push({
        country: d['Country of birth'],
        num: num
      });
    } else if (num>10000) {
      for(var i=1; i<num/10000; i++){
        parseData.push({
          country: d['Country of birth'],
          num: 10000
        });
      }
        parseData.push({
          country: d['Country of birth'],
          num: num%10000
        })
    }
    return parseData;
    }
   var array = isNaN(d['2015'])? [] :newData(+d['2015']);
  return array;
}
