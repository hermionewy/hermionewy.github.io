console.log('7.1');

//First, append <svg> element and implement the margin convention
var m = {t:50,r:200,b:50,l:200};
var outerWidth = document.getElementById('canvas').clientWidth,
    outerHeight = document.getElementById('canvas').clientHeight;
var w = outerWidth - m.l - m.r,
    h = outerHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width',outerWidth)
    .attr('height',outerHeight)
    .append('g')
    .attr('transform','translate(' + m.l + ',' + m.t + ')');

var colors = d3.scaleOrdinal().range(d3.schemeCategory10);

var scaleX, scaleY;

//Step 1: importing multiple datasets
d3.queue()
    .defer(d3.csv,'../data/olympic_medal_count_1900.csv',parse)
    .defer(d3.csv,'../data/olympic_medal_count_1960.csv',parse)
    .defer(d3.csv,'../data/olympic_medal_count_2012.csv',parse)
    .defer(d3.csv,'../data/olympic_medal_count_2016.csv',parse)
    .await(function(err,rows1900,rows1960,rows2012,rows2016){
        //Draw axis
        scaleY = d3.scaleLinear()
            .domain([0,140])
            .range([h,0]);
        scaleX = d3.scaleLinear()
            .domain([0,9])
            .range([0,w]);

        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickSize(-w-200);

        plot.append('g')
            .attr('class','axis axis-y')
            .attr('transform','translate(-100,0)')
            .call(axisY);


        //Step 2: implement the code to switch between three datasets

        d3.select('#year-1900').on('click', function(){
            draw(rows1900);
        });
        d3.select('#year-1960').on('click', function(){
            draw(rows1960);
        });
        d3.select('#year-2012').on('click', function(){
            draw(rows2012);
        });
        d3.select('#year-2016').on('click', function(){
            draw(rows2016);
        });

    });


//Step 3: implement the enter / exit / update pattern
function draw(rows){
    var top10 = rows.sort(function(a,b){
        return b.count - a.count;
    }).slice(0,10);

    console.table(top10);

    var nodes = plot.selectAll('.country')
        .data(top10, function(d){return d.country;});

    //enter
    var nodesEnter = nodes.enter()
        .append('g')
        .attr('class','country')
        .attr('transform', function (d,i){
          return 'translate('+ scaleX(i) + ','+ scaleY(d.count) +')';
        });

    //undate
    var enterSet= nodesEnter.append('rect')
        .style('fill',function(d,i){return colors(i)})
        .attr('width',40)
        .attr('height', function(d){return h-scaleY(d.count);});

    nodesEnter.append('text')
        .attr('y', -50)
        .attr('text-anchor','right')
        .text(function(d){return d.country;});

    //nodesExit
    nodes.exit().remove();

    //nodesTransition
    var nodesTransition = nodes.merge(nodesEnter)
        .transition().duration(1000)
        .attr('transform', function (d,i){
          return 'translate('+ scaleX(i) + ','+ scaleY(d.count) +')';
        })
        .style('fill',function(d,i){return colors(i)});

    nodesTransition.select('rect')
        .attr('height',function(d){return h-scaleY(d.count);})
        .style('fill',function(d,i){return colors(i)});

    // tooltip


}


function parse(d){
    return {
        country: d.Country,
        count: +d.count
    }
}
