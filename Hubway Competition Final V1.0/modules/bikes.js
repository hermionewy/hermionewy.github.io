function BikeTime(){

	var T0 = new Date(2016,0,1),
		  T1 = new Date(2017,0,1);
	var _interval = d3.timeWeek;
	var _accessor = function(d){
		return d.startTime;
	};
  var _time = 3600*52;
	var W, H, M ={t:30,r:40,b:30,l:40};
	var scaleX, scaleY;
  var _dispatcher = d3.dispatch('selectBike');
	var exports = function(selection){
		//Set initial internal values
		//Some of these will be based on the incoming selection argument
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var arr = selection.datum()?selection.datum():[]; //{key: values: }

		//Histogram layout
		//The value, domain and threshold properties are internal to this function
    var histogram = d3.histogram()
     			.value(_accessor)
     			.domain([T0,T1])
     			.thresholds(_interval.range(T0,T1,1));
    var bikeValue = Array.from (arr, function(d){
			  var bins = histogram(d.values);  //all bins of one bike
				var values = Array.from (bins, function(bin){
						var workingSeconds = d3.sum(bin, function(d){ return d.duration});
						if(workingSeconds<3600*24*7){return workingSeconds;}else {
							return 3600*24*7;
						}
					 // for each bin sum up the duration
				});
				var maxInBin = values.reduce(function(a,b){ return Math.max(a,b)});
				return maxInBin;
		});

		var max = bikeValue.reduce(function(a,b){ return Math.max(a,b)});
	  var maxY = max/3600, //hours
		 		scaleX = d3.scaleTime().domain([T0,T1]).range([0,W]),
				scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);
				console.log(maxY);
  //  console.log(d3.max(arr, function(d) { return d.utility; }));
    //console.log(bigValueOfBins);
		//Represent
		//Axis, line and area generators
		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(
						(d3.sum(d, function(bike){return bike.duration/3600}))<24*7?(d3.sum(d, function(bike){return bike.duration/3600})):24*7
				)} );
		var axisX = d3.axisBottom()
			.scale(scaleX)
			.ticks(d3.timeMonth.every(2));
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(5);

		var svg = selection.selectAll('svg')
			.data([1]);


		var svgEnter = svg.enter()
			.append('svg') //ENTER
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b);

		var plotEnter = svgEnter.append('g').attr('class','plot time-series')
			.attr('transform','translate('+M.l+','+M.t+')');

		plotEnter.append('g').attr('class','axis axis-y');
		plotEnter.append('g').attr('class','axis axis-x');
		plotEnter.append("text")
				.attr('class','yAxisText')
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - M.l)
				.attr("x",0 - (H / 2))
				.attr("dy", "0.8em")
				.style("text-anchor", "middle")
				.style('font-size','0.7em')
				.text("Bike Count");

		//plotEnter.append('path').attr('class','line');

    var path = svg.merge(svgEnter)
        .select('.plot')
        .attr('transform','translate('+M.l+','+M.t+')')
        .selectAll('.line')
        .data(arr); //a few bikes
    var pathEnter = path.enter()
        .append('path')
        .attr('class','line')
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.select('.title')
                .html( 'Bike ID'+ ':' + d.key);
            tooltip.transition().style('opacity',1);

            d3.select(this).style('stroke-width','2px').style('opacity', 1).style('stroke','#f03');
        })
        .on('mousemove',function(d){
            var tooltip = d3.select('.custom-tooltip');
            var xy = d3.mouse( d3.select('.container-fluid').node() );
            tooltip
                .style('left',xy[0]+3+'px')
                .style('top',xy[1]+3+'px');
            d3.select(this).style('stroke-width','2px').style('opacity', 1).style('stroke','#f03');
        })
        .on('mouseleave',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.transition().style('opacity',0);
            d3.select(this).style('stroke-width','1px').style('opacity', 0.3).style('stroke','#f03');
        })
        .on('click', function(d){
          _dispatcher.call('selectBike',this,d.values);
        });

        path.exit().remove();

		path.merge(pathEnter)
				.attr('d',function(datum){
					var dayBins = histogram(datum.values);
						return line(dayBins);
				})
				.style('fill','none')
				.style('stroke-width','1px')
				.style('opacity', 0.1);

		var plot = svg.merge(svgEnter).select('.plot');
				plot.select('.axis-y').transition()
					.call(axisY);
				plot.select('.axis-x')
					.attr('transform','translate(0,'+H+')')
					.transition()
					.call(axisX);
				plot.select('.yAxisText')
						.attr("y", 0 - M.l)
						.attr("x",0 - (H / 2))
						.attr("dy", "1em")
						.style("text-anchor", "middle")
						.text("Working hour/week");

	}
	exports.on = function(){
	_dispatcher.on.apply(_dispatcher,arguments);
	return this;
}
	exports.domain = function(_arr){
		if(!arguments.length) return [T0,T1];
		T0 = _arr[0];
		T1 = _arr[1];
		return this;
	}

	exports.interval = function(_int){
		_interval = _int;
		return this;
	}

	exports.value = function(_acc){
		if(!arguments.length) return _accessor;
		_accessor = _acc;
		return this;
	}

	return exports;
}
