/**
 * Created by YanWu on 05/07/17.
 */

var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b,
    w2 = document.getElementById('canvas3').clientWidth - m.l - m.r,
    h2 = document.getElementById('canvas3').clientHeight - m.l - m.r,
    Np = 5000;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var plot2 = d3.select('#canvas3')
    .append('svg')
    .attr('width', w2+ m.l + m.r)
    .attr('height', h2+ m.t + m.b)
    .append('g').attr('class','plot2')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var projection,path,mapData;
var dataMapping;
var clicked =1;
var xMap = function(d){
  if (dataMapping.get(d.country)) {
    var centerX = path.centroid(dataMapping.get(d.country).geometry)[0];
      return centerX? centerX: 600;
     }
      return -100;
     }

var yMap = function(d){
      if (dataMapping.get(d.country)) {
        var centerY = path.centroid(dataMapping.get(d.country).geometry)[1];
          return centerY?centerY:600;
      } else {
          return 600;
      }
  }
var scaleR = d3.scaleLinear().domain([0,Np]).range([0,4]);
var selectedGroupBtn;
var years =[2006,2007,2008,2009,2010,2011,2012,2013,2014,2015];
var allOcc;
var allReasons = ['Family-sponsored preferences','Employment-based preferences','Immediate relatives of U.S. citizens','diversity,Refugees and asylees','Other'];
var chooseYear='2015';
var globalDispatch = d3.dispatch('update');
function outputUpdate(vol) {
  chooseYear = vol;
	document.querySelector('#showYear').value = vol;
  console.log(chooseYear);
  globalDispatch.call('update',this,chooseYear);
}
function filterData(d){
  return d.year == chooseYear;
}
d3.queue()
  .defer(d3.csv,'data/BirthRegion06to15.csv',parseRegions)
  .defer(d3.json, 'data/countries.geo.json')
  .defer(d3.json, 'data/gz_2010_us_040_00_5m.json')
  .defer(d3.csv, 'data/residentState06to15.csv',parseStates)
  .defer(d3.csv, 'data/ImmigrantOcp0607.csv',parseOcp)
	.await(dataLoaded);

function dataLoaded(err,regions, countries, states,statesPop,occupation){
  var newRegions = [].concat.apply([], regions);
  var newStates = [].concat.apply([], statesPop);
  console.log(newStates);

  var occNested = d3.nest().key(function(d){return d.ocp}).entries(occupation);
      allOcc = occNested.map(function(d){ return d.key });
      var occ = Occupation().chooseYear('2015');
        plot.datum(occupation).call(occ);
  globalDispatch.on('update', function(y){
    var occ = Occupation().chooseYear(y);
    //occ.start();
      plot.datum(occupation).call(occ);
  });


   var worldMap = Map().projection(d3.geoMercator()).scaleP(160);
   plot2.datum(countries).call(worldMap);
   var createNodes = DrawNodes().x(xMap).y(yMap);
   var filterRegions = newRegions.filter(filterData);

   plot2.datum(filterRegions).call(createNodes);
   globalDispatch.on('update.mapA', function(y){
     var newD = newRegions.filter(filterData);
     console.log(newD);
     var createNodes = DrawNodes().x(xMap).y(yMap);
     plot2.datum(newD).call(createNodes);
   });


    d3.select('#button1')
	      .on('click.country',function(d){
          var newD = newRegions;
          globalDispatch.on('update.mapA', function(y){
            newD = newRegions.filter(filterData);
            var createNodes = DrawNodes().x(xMap).y(yMap);
            plot2.datum(newD).call(createNodes);
          });

	         d3.select('#button2').classed('active',false);
	         d3.select(this).classed('active',true);

           var worldMap = Map().projection(d3.geoMercator()).scaleP(160);
           plot2.datum(countries).call(worldMap);
           var createNodes = DrawNodes().x(xMap).y(yMap);
           plot2.datum(newD).call(createNodes);
	         });
     d3.select('#button2')
         .on('click.state',function(d){
           var newD = newStates.filter(filterData);
           globalDispatch.on('update.mapA', function(y){
             var createNodes = DrawNodes().x(xMap).y(yMap);
             newD = newStates.filter(filterData);
             plot2.datum(newD).call(createNodes);
           });

            d3.select('#button1').classed('active',false);
            d3.select(this).classed('active',true);

            var USMap = Map().projection(d3.geoAlbersUsa()).scaleP(1000);
            plot2.datum(states).call(USMap);
            var statesNodes = DrawNodes().x(xMap).y(yMap);
            plot2.datum(newD).call(statesNodes);

            });

//  var maxNum= d3.max(newRegions, function(d){ return d.num})


}

function parseRegions(d){
  var parseData=[];
  var concatData=[];
  var array;
  function newData(num,y){  //d['2015']
    if(num <Np){
      parseData.push({
        country: d['Country of birth'],
        num: num,
        year: y
      });
    } else if (num>Np) {
      for(var i=1; i<num/Np; i++){
        parseData.push({
          country: d['Country of birth'],
          num: Np,
          year: y
        });
      }
        parseData.push({
          country: d['Country of birth'],
          num: num%5000,
          year: y
        })
    }
    return parseData;
    }
    for( var j=2009; j<2016; j++){
      array = isNaN(d[j])? [] :newData(+d[j],j);
      concatData.push(array);
    }
  return array;
}

function parseStates(d){
  var parseData=[];
  var concatData=[];
  var array;
  function newData(num,y){  //d['2015']
    if(num <5000){
      parseData.push({
        country: d['State or territory of residence'],
        num: num,
        year:y
      });
    } else if (num>5000) {
      for(var i=1; i<num/5000; i++){
        parseData.push({
          country: d['State or territory of residence'],
          num: 5000,
          year:y
        });
      }
        parseData.push({
          country: d['State or territory of residence'],
          num: num%5000,
          year:y
        })
    }
    return parseData;
    }
    for( var j=2009; j<2016; j++){
      array = isNaN(d[j])? [] :newData(+d[j],j);
      concatData.push(array);
    }

  return array;
}

function parseOcp(d){
  return{
    year:d['Year'],
    ocp:d['Characteristic'],
    num:+d['Total'],
    family:+d['Family-sponsored preferences'],
    employment:+d['Employment-based preferences'],
    relative:+d['Immediate relatives of U.S. citizens'],
    diversity:+d['diversity'],
    refugee:+d['Refugees and asylees'],
    other:+d['Other']
  }
}
