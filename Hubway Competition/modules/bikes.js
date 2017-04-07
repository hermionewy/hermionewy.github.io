function BikeTime(){

	var T0 = new Date(2016,0,1),
		  T1 = new Date(2016,11,31);
	var _interval = d3.timeWeek;
	var _accessor = function(d){
		return d.startTime;
	};
  var _time = 3600*24*7;
	var W, H, M ={t:30,r:40,b:30,l:40};
	var scaleX, scaleY;

	var exports = function(selection){
		//Set initial internal values
		//Some of these will be based on the incoming selection argument
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var arr = selection.datum()?selection.datum():[]; //{key: values: duration}

		//Histogram layout
		//The value, domain and threshold properties are internal to this function
    var histogram = d3.histogram()
     			.value(_accessor)
     			.domain([T0,T1])
     			.thresholds(_interval.range(T0,T1,1));

		var maxY = 0.5,
		scaleX = d3.scaleTime().domain([T0,T1]).range([0,W]),
		scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);
  //  console.log(d3.max(arr, function(d) { return d.utility; }));

		//Represent
		//Axis, line and area generators

		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(
						d3.sum(d, function(bike){
							return bike.duration/_time;
						})
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
		//plotEnter.append('path').attr('class','line');
    var path = svg.merge(svgEnter)
        .select('.plot')
        .attr('transform','translate('+M.l+','+M.t+')')
        .selectAll('path')
        .data(arr); //a few bikes
    var pathEnter = path.enter()
        .append('path')
        .attr('class','line')
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.select('.title')
                .html( 'Bike ID'+ ':' + d.key);
            tooltip.select('.value')
                .html('The overall utility rate of this bike is '+ d.utility)
            tooltip.transition().style('opacity',1);

            d3.select(this).style('stroke-width','2px').style('opacity', 1).style('stroke','red');
        })
        .on('mousemove',function(d){
            var tooltip = d3.select('.custom-tooltip');
            var xy = d3.mouse( d3.select('.container').node() );
            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');
            d3.select(this).style('stroke-width','2px').style('opacity', 1).style('stroke','red');
        })
        .on('mouseleave',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.transition().style('opacity',0);
            d3.select(this).style('stroke-width','1px').style('opacity', 0.2);
        })
        .on('click', function(d){
          console.log(d);
          //_dispatcher.call('timerange:select',this,data.values);
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


	}

	//setting config values
	//"Getter" and "setter" functions
// 	exports.on = function(){
// 	_dispatcher.on.apply(_dispatcher,arguments);
// 	return this;
// }
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
