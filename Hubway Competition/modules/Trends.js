function Trends(){
  var _time = 60*366;
	var _accessor = function(d){
		return d.duration; //overall seconds per day
	};
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

    var arr0 = data.sort(function(a,b){ return a.duration - b.duration} );
    var arr = Array.from(arr0, function(d){ return {
      'bikeId': d.bikeId,
      'duration':d.duration/_time //hours per day
    }});
    var maxDuration = arr[arr.length-1].duration;
    var _domain =[0, maxDuration],
    _thresholds = d3.range(0,maxDuration,10);

		var brush = d3.brushX()
				.on('end',brushend);

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

		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(d.length)} )
			.curve(d3.curveCatmullRom.alpha(0.5));
		var area = d3.area()
			.x(function(d){return scaleX(d.x0)})
			.y0(function(d){return H})
			.y1(function(d){return scaleY(d.length)})
			.curve(d3.curveCatmullRom.alpha(0.5));
		var axisX = d3.axisBottom()
		  .tickSize(-5)
			.scale(scaleX)
			.ticks(12);
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(4);

		var svg = selection.selectAll('svg')
			.data([dayBins]);

		var svgEnter = svg.enter()
			.append('svg') //ENTER
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b);

			var plotEnter = svgEnter.append('g').attr('class','plot time-series')
				.attr('transform','translate('+M.l+','+M.t+')');
			plotEnter.append('path').attr('class','area');
			plotEnter.append('g').attr('class','axis axis-y');
			plotEnter.append('path').attr('class','line');
			plotEnter.append('g').attr('class','axis axis-x');
			plotEnter.append('g').attr('class','brush');

			//var circle =
			//Update
			var plot = svg.merge(svgEnter)
				.select('.plot')
				.attr('transform','translate('+M.l+','+M.t+')');
			plot.select('.area').transition()
				.attr('d',area);
			plot.select('.line').transition()
				.attr('d',line);
			plot.select('.axis-y').transition()
				.call(axisY);
			plot.select('.axis-x')
				.attr('transform','translate(0,'+H+')')
				.transition()
				.call(axisX);

			//Call brush function
			plot.select('.brush')
				.call(brush)
        .call(brush.move, [120, 200]);
			function brushend(){
				if(!d3.event.selection) {_dispatcher.call('timerange:select',this,null); return;}
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
