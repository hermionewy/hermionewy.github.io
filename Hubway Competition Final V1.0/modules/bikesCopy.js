function BikeLines(){

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
						return workingSeconds; // for each bin sum the duration
				});
				var maxInBin = values.reduce(function(a,b){ return Math.max(a,b)});
				return maxInBin;
		});
		var max = bikeValue.reduce(function(a,b){ return Math.max(a,b)});
	  var maxY = max/_time, //hours
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
						d3.sum(d, function(bike){
							return bike.duration/_time; //working hours weekly
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

		var plot = svg.merge(svgEnter).select('.plot');
				plot.select('.axis-y').transition()
					.call(axisY);
				plot.select('.axis-x')
					.attr('transform','translate(0,'+H+')')
					.transition()
					.call(axisX);

     var canvas = plot.append('canvas')
		 					.style('left', M.l+'px')
							.style('top', M.t + 'px'),
		     context = canvas.node().getContext('2d');
				 context.fillStyle = '#f0f';
				 context.beginPath();
				 ctx.beginPath();
			    ctx.moveTo(75, 50);
			    ctx.lineTo(100, 75);
			    ctx.lineTo(100, 25);
			    ctx.fill();

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
