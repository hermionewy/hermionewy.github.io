console.log('8.3');

var m = {t:100,r:100,b:100,l:100};
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

//d3.set to hold a unique array of airlines
var airlines = d3.set();
console.log(airlines);
//Scale
var scaleX = d3.scaleTime()
    .range([0,w]);
var scaleColor = d3.scaleOrdinal()
    .range(['#fd6b5a','#03afeb','orange','#06ce98','blue']);
var scaleY = d3.scaleLinear()
    .domain([0,1000])
    .range([h,0]);

//Axis
var axisX = d3.axisBottom()
    .scale(scaleX)
    .tickSize(-h);
var axisY = d3.axisLeft()
    .scale(scaleY)
    .tickSize(-w);

//Line generator
var FlightData;

d3.queue()
    .defer(d3.csv, '../data/bos-sfo-flight-fare.csv',parse)
    .await(function(err, data){

        //Mine the data to set the scales
        scaleX.domain( d3.extent(data,function(d){return d.travelDate}) );
        scaleColor.domain( airlines.values() );

        //Add buttons
        d3.select('.btn-group')
            .selectAll('.btn')
            .data( airlines.values() )
            .enter()
            .append('a')
            .html(function(d){return d})
            .attr('href','#')
            .attr('class','btn btn-default')
            .style('color','white')
            .style('background',function(d){return scaleColor(d)})
            .style('border-color','white')
            .on('click',function(d){
                //Hint: how do we filter flights for particular airlines?
                FlightData = data.filter(function(data){return data.airline==d});
                console.log(FlightData);
                //How do we then update the dots?

                draw(FlightData);
            });

        //Draw axis
        plot.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisX);
        plot.append('g').attr('class','axis axis-y')
            .call(axisY);

        plot.append('path').attr('class','time-series');

        d3.select('.btn-group')
            .append('a')
            .html('All')
            .attr('href','#')
            .attr('class','btn btn-default')
            .style('color','white')
            .style('background','gray')
            .style('border-color','white')
            .on('click',function(){
                //Hint: how do we filter flights for particular airlines?
                draw(data);
            });
        draw(data);



    });

function draw(rows){
    //IMPORTANT: data transformation
    var flightsByTravelDate = d3.nest().key(function(d){return d.travelDate})
        .entries(rows);

    flightsByTravelDate.forEach(function(day){
       day.averagePrice = d3.mean(day.values, function(d){return d.price});
    });

    var flightByDateSequence = flightsByTravelDate.sort(function(a,b){
      return new Date(a.key) - new Date(b.key);
    })
    console.log(flightByDateSequence);

    //Draw dots
    var node=plot.selectAll('.flight')
        .data(rows,function(d){return d.id})

    var nodeEnter = node.enter()//placeholder to all the DOM
        .append('circle').attr('class','flight') //Why now?
        .merge(node)//Why now? selectAll again?
        .attr('cx',function(d){return scaleX(d.travelDate)})
        .attr('cy',function(d){return scaleY(d.price)})
        .attr('r',3)
        .style('fill',function(d){return scaleColor(d.airline)})
        .style('fill-opacity',.75)

    var tooltip=d3.select('.custom-tooltip');

        nodeEnter.on('mouseenter',function(d){
            tooltip.select('.title')
              .html('Airline:'+d.airline);
            tooltip.select('.value')
              .html('Travel Date:'+d.travelDate+'<br>'+'Price: $'+d.price)
            tooltip.transition().style('opacity',.75)

         })
        .on('mousemove',function(d){
            var xy=d3.mouse(d3.select('.container').node());
            tooltip.style('left',xy[0]+10+'px')
                   .style('top',xy[1]+10+'px');
         })
        .on('mouseleave',function(d){
            tooltip.transition().style('opacity',0);
        })

        node.exit().remove();

    //Draw <path>
    var lineGenerator = d3.line()
        .x(function(d){return scaleX(new Date(d.key))})
        .y(function(d){return scaleY(d.averagePrice)})
        .curve(d3.curveCardinal);

    plot.select('.time-series')
    .datum(flightByDateSequence)
    .attr('d',function(d){return lineGenerator(d)})
    .style('fill','none')
    .style('stroke-width','2px')
    .style('stroke','gray');


}

function parse(d){

    if( !airlines.has(d.airline) ){
        airlines.add(d.airline);
    }

    return {
        airline: d.airline,
        price: +d.price,
        travelDate: new Date(d.travelDate),
        duration: +d.duration,
        id: d.id
    }
}
