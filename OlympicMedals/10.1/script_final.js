console.log('10.1');

var m = {t:50,r:50,b:50,l:50},
    w = (document.getElementById('canvas').clientWidth - m.l - m.r)*.7,
    h = (document.getElementById('canvas').clientHeight - m.t - m.b)*.7;

var plot = d3.select('.canvas')
    .append('div').attr('class','col-md-9 serif')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', 2*h + m.t + m.b)
    .append('g').attr('class','plot')
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

// bars
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
    .domain([0,500])
    .range([h,0]);

var axisY = d3.axisLeft()
    .scale(scaleYP)
    .tickSize(-w-150);
var axisX = d3.axisBottom()
    .scale(scaleXP)
    .tickSize(-h);

d3.queue()
    .defer(d3.json, '../data/countries.geo.json')
    .defer(d3.csv, '../data/Summer Olympic medallists 1896 to 2008.csv',parseData)
    .await(function(err, geo, data){
      // Medal data nest
      var countries = d3.nest()
          .key(function(d){return d.country})
          .rollup(function(leaves) { return leaves.length; })
          .entries(data);

          countries.forEach(function(d){
            rate.set(d.key,+d.value)
          });



      //medals by country
      var medalsSort = d3.nest()
          .key(function(d){return d.country}).sortKeys(d3.ascending)
          .key(function(d){return d.edition}).sortKeys(d3.ascending)
          .rollup(function(leaves) { return leaves.length; });

      var medalsPerYear = medalsSort.entries(data);
      //all medals descending
      medalsPerYear.forEach(function(year){
      year.allMedals=d3.sum(year.values,function(d){return d.value})
    });
      /*var medalSequence = medalsPerYear.sort(function(a,b){
            return b.allMedals - a.allMedals;
          })
      var topTen=medalSequence.slice(0,10);*/
      //get the 10 counties with most models


  //medals by country and year
  var medalsByTopic= d3.nest()
      .key(function(d){return d.medal})
      .entries(data);
  //all medals descending
//  console.log(medalsByTopic);

// draw path
plot.append('path').attr('class','time-series');
drawAxis();

var button=d3.select('.btn-group')
    .selectAll('.btn')
    .data(medalsByTopic)
    .enter()
    .append('a')
    .html(function(d){return d.key})
    .attr('href','#')
    .attr('class','btn btn-default')
    .style('color','white')
    .style('background',function(d){return scaleColor(d.key)})
    .style('border-color','white');

 button.on('click',function(d){
        medalsPerYear={};
        medalsPerYear=medalsSort.entries(data.filter(function(data){return data.medal==d.key}));//medalsPerYear.entries(data.filter(function(data){return data.medal==d.key}));
        medalsPerYear.forEach(function(year){
        year.allMedals=d3.sum(year.values,function(d){return d.value})});
        console.log(medalsPerYear);
      });
        console.log(medalsPerYear);
//Dropdown Menu One
var dropDown=d3.select('.dropDown'),
    options = dropDown.selectAll('option')
      .data(medalsPerYear)
      .enter()
      .append('option')
      .text(function(d){return d.key;})
      .attr('value',function(d){return d.allMedals});

    dropDown.on('change',menuChanged)
    function menuChanged(){
      var si   = dropDown.property('selectedIndex'),
          s    = options.filter(function (d, i) { return i === si }),
          data = s.datum();
      console.log(data);
      drawPath(data.values);
      drawNode(data.values);
    }

        // append path


      drawMap(geo,countries);
    });

//drawMap Function
function drawMap(geo, countries){
  var maps = plot.selectAll('.country')
    .data(geo.features)
    .enter()
    .append('path').attr('class','country')
    .attr('d',pathGenerator)
    .style('fill',function(d){
      var id=d.id;
      if(isNaN(rate.get(id))==0){
        return scaleColor(rate.get(id));} else {
          countries.push({key: id, value: 0});
        }
    })
    .style('opacity',.7)
    .style('stroke-width','1px')
    .style('stroke','white');

    countries.forEach(function(d){
      rate.set(d.key,+d.value)
    });
  projection.fitExtent([[0,0],[w,h]],countries);

  //tooltip
        maps.on('mouseenter',mouseEnter)
            .on('mousemove',mouseMove)
            .on('mouseleave',mouseLeave);
}

function mouseEnter(d){
    var tooltip = d3.select('.custom-tooltip');

    tooltip.select('.title').html(d.properties.name);
    tooltip.select('.value').html("Total Medals count is "+rate.get(d.id)+".");

    tooltip
        .style('visibility','visible')
        .transition()
        .style('opacity',1);

    d3.select(this).transition().style('opacity',1);
}

function mouseMove(d){
var xy = d3.mouse(d3.select('.container').node());

var tooltip = d3.select('.custom-tooltip')
  .style('left',xy[0]+20+'px')
  .style('top',xy[1]+20+'px');
}

function mouseLeave(d){
var tooltip = d3.select('.custom-tooltip');

tooltip
  .style('visibility','hidden')
  .style('opacity',0);

d3.select(this).transition().style('opacity',.7);
}
    // Draw axis
function drawAxis(){
  plot.append('g').attr('class','axis axis-x')
      .attr('transform','translate(0,'+h+')')
      .call(axisX);
  plot.append('g').attr('class','axis axis-y')
      .call(axisY);
}

function drawPath(d){
var lineGenerator = d3.line()
      .x(function(d){return scaleXP(d.key)})
      .y(function(d){return scaleYP(d.value)})
      .curve(d3.curveCardinal);

  plot.select('.time-series')
      .datum(d)
      .attr('d',function(d){return lineGenerator(d)})
      .style('fill','none')
      .style('stroke-width','2px')
      .style('stroke','gray');
}

function drawNode(node){
  var node=plot.selectAll('.circle')
    .data(node,function(d){return d.key})
  var nodeEnter = node.enter()//placeholder to all the DOM
    .append('circle').attr('class','circle')
    .merge(node)
    .attr('cx',function(d){return scaleXP(d.key)})
    .attr('cy',function(d){return scaleYP(d.value)})
    .attr('r',3)
    .style('fill','red')
    .style('fill-opacity',.75);

    node.exit().remove();

    nodeEnter.on('mouseenter',function(d){
        var tooltip = d3.select('.custom-tooltip');
        console.log(d);
            tooltip.select('.title')
              .html('Edition: '+ d.key);
            tooltip.select('.value')
              .html('Medals: '+ d.value);
            tooltip.style('visibility','visible').transition().style('opacity',.75)

         })
        .on('mousemove',mouseMove)
        .on('mouseleave',mouseLeave)

}
    // draw bars function
function draw(d){
  var nodes = plot.selectAll('.bars')
      .data(d)
      .enter()
      .append('g')
      .attr('class','bars')
      .attr('transform', function(d,i){
        return 'translate('+ scaleX(i) +',0)';
      });

      nodes.append('g')
      .append('rect')
      .attr('y', function(d){ return scaleY(d.value);})
      .attr('width', 20)
      .attr('height', function(d){return h-scaleY(d.value);});

      nodes.append('text')
      .attr('y',h+20)
      .attr('text-anchor','right')
      .text(function(d){return d.key;});
    }

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
