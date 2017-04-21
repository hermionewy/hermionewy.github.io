function Trends(){
  console.log('Timeseries2');
  var _time = 3600*366;
	var _accessor = function(d){
		return d.value; //overall seconds per day
	};
  var _brushable=true;
  //duration/(366*60)
	var W, H, M ={t:30,r:40,b:30,l:40};
	var scaleX, scaleY;
	var _dispatcher = d3.dispatch('timerange:select');

	var exports = function(selection){
		//Set initial internal values
		//Some of these will be based on the incoming selection argument
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var data = selection.datum()?selection.datum():[]; //bikeid  -  tripduration

    var arr0 = Array.from(data, function(d){ return {
      'key': d.key,
      'value':d.value/_time //hours per day
    }});

    var arr = arr0.sort(function(a,b){ return a.value - b.value} );
    var a = (arr[arr.length-1])? (arr[arr.length-1]): d3.max(arr, function(d){ return d.value});
    var maxDuration = a<12? a:12;
    var _domain =[0, maxDuration],
    _thresholds = d3.range(0,maxDuration,0.2);

		var histogram = d3.histogram()
     			.value(_accessor)
     			.domain(_domain)
     			.thresholds(_thresholds);

		var dayBins = histogram(arr);

		var maxY = d3.max(dayBins,function(d){return d.length});
		var scaleX = d3.scaleLinear().domain(_domain).range([0,W]);
		var scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);

		//Represent
		//Axis, line and area generators
		var axisX = d3.axisBottom()
		  .tickSize(-5)
			.scale(scaleX)
			.ticks(9);
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(4);
		var brush = d3.brushX()
				.on('end',brushend);
		var svg = selection.selectAll('svg')
			.data([1]);

		var svgEnter = svg.enter()
			.append('svg') //ENTER
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b);

			var plotEnter = svgEnter.append('g').attr('class','plot time-series')
				.attr('transform','translate('+M.l+','+M.t+')');
			plotEnter.append('g').attr('class','axis axis-x');

      var plot = svg.merge(svgEnter)
        .select('.plot')
        .attr('transform','translate('+M.l+','+M.t+')');

			var rect = plot.selectAll('rect').data(dayBins);
			var rectEnter = rect.enter().append('rect').attr('class','bikeCount');
      rect.exit().remove();

			plotEnter.append('g').attr('class','axis axis-y');


			plotEnter.append('g').attr('class','brush').attr('width',W).attr('height',H);
			plotEnter.append('line').attr('class','medianLine').style('stroke-dasharray',('4,3')).style('stroke','red');
			plotEnter.append('line').attr('class','meanLine').style('stroke-dasharray',('2,2')).style('stroke','#0990C6');
			plotEnter.append('text').attr('class','medianText');
			plotEnter.append('text').attr('class','meanText');
			plotEnter.append("text")
					.attr('class','yAxisText')
		      .attr("transform", "rotate(-90)")
		      .attr("y", 0 - M.l)
		      .attr("x",0 - (H / 2))
		      .attr("dy", "0.8em")
		      .style("text-anchor", "middle")
					.style('font-size','0.7em')
		      .text("Bike Count");
			plotEnter.append("text")
					.attr('class','xAxisText')
		      .attr("y", H+25)
		      .attr("x", W/2)
		      .attr("dx", "0.8em")
		      .style("text-anchor", "middle")
					.style('font-size','0.7em')
		      .text("Working Hour/day");

			//var circle =
			//Update

				plot.select('.axis-y')
					.call(axisY);
				plot.select('.axis-x')
					.attr('transform','translate(0,'+H+')')
					.transition()
					.call(axisX);
			plot.selectAll('.bikeCount')
				.attr('x', function(d){ return scaleX(d.x1)})
				.attr('y', function(d){ return scaleY(d.length)})
				.attr('width', function(d){return scaleX(d.x1-d.x0)})
				.attr('height', function(d){ return H - scaleY(d.length)})
				.style('fill-opacity', .1) // set the fill opacity
				.style('stroke', '#A5C0D1')    // set the line colour
				.style('fill', '#f03');


			var median = (arr.length%2)? arr[(arr.length+1)/2].value : arr[arr.length/2].value;
			var mean = d3.mean(arr,function(d){ return d.value });
			plot.select('.medianLine')
					.attr('x1',scaleX(median))
					.attr('y1',0-M.t)
					.attr('x2',scaleX(median))
					.attr('y2',H);
			plot.select('.meanLine')
					.attr('x1',scaleX(mean))
					.attr('y1',0)
					.attr('x2',scaleX(mean))
					.attr('y2',H+M.b);
			plot.select('.medianText')
					.attr("y", 0 - M.l)
					.attr("x", scaleX(median)+8)
					.attr("dy", "3em")
					.text("Median");
			plot.select('.meanText')
					.attr("y", H/2)
					.attr("x", scaleX(mean)+8)
					.attr("dy", "3em")
					.text("Mean");
			plot.select('.yAxisText')
					.attr("y", 0 - M.l)
					.attr("x",0 - (H / 2))
					.attr("dy", "1em")
					.style("text-anchor", "middle")
					.text("Bike Count");


			if(_brushable){plot.select('.brush')
				.call(brush)
				.call(brush.move, [120, 180]);}
			function brushend(){
				//if(!d3.event.selection) {_dispatcher.call('timerange:select',this,null); return;}
				var t0 = scaleX.invert(d3.event.selection[0]),
					t1 = scaleX.invert(d3.event.selection[1]);
				_dispatcher.call('timerange:select',this,[t0,t1]);
			}
	}


	//setting config values
	//"Getter" and "setter" functions
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
		_time = _int;
		return this;
	}
  exports.brushable = function(_){
    _brushable = _;
    return this;
  }
	exports.value = function(_acc){
		if(!arguments.length) return _accessor;
		_accessor = _acc;
		return this;
	}

	return exports;
}
