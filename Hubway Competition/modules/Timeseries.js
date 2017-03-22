function Timeseries(){

	var T0 = new Date(2016,2,1),
		T1 = new Date(2016,11,32);
	var _interval = d3.timeDay;
	var _accessor = function(d){
		return d.startTime;
	};
	var W, H, M ={t:30,r:40,b:30,l:40};
	var scaleX, scaleY;

	var exports = function(selection){
		//Set initial internal values
		//Some of these will be based on the incoming selection argument
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var arr = selection.datum()?selection.datum():[];
		//Histogram layout
		//The value, domain and threshold properties are internal to this function


    // nest the data by id
    var tripNestById = d3.nest()
				.key(function(d){return d.bikeId })
				.entries(arr);

    console.log(tripNestById.length); //1800
		console.log(tripNestById[1].values);

    var histogram = d3.histogram()
     			.value(_accessor)
     			.domain([T0,T1])
     			.thresholds(_interval.range(T0,T1,1));

 		var dayBins = histogram(tripNestById[0].values); // An array of 306 arraies
      console.log(dayBins);

    tripNestById.forEach(function(d){
      var dayBins = histogram(d.values);// An array of 306 arraies
      d.daybins= dayBins.map(function(arr){ return arr.length; });
      console.log(d.key, d.daybins);
    })

		var maxY = d3.max(dayBins,function(d){return d.length}),
		scaleX = d3.scaleTime().domain([T0,T1]).range([0,W]),
		scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);
    console.log(maxY);
		//Represent
		//Axis, line and area generators
		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(d.length)});
		var axisX = d3.axisBottom()
			.scale(scaleX)
			.ticks(d3.timeMonth.every(1));
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(4);

		//Set up the DOM structure like so:
		/*
		<svg>
			<g class='plot'>
				<g class='axis axis-y' />
				<path class='line' />
				<g class='axis axis-x' />
			</g>
		</svg>
		*/
		var svg = selection.selectAll('svg')
			.data([dayBins])


		var svgEnter = svg.enter()
			.append('svg') //ENTER
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b);

		var plotEnter = svgEnter.append('g').attr('class','plot time-series')
			.attr('transform','translate('+M.l+','+M.t+')');
		plotEnter.append('g').attr('class','axis axis-y');
		plotEnter.append('g').attr('class','axis axis-x');
    plotEnter.append('path').attr('class','line');

		//Update
		var plot = svg.merge(svgEnter)
			.select('.plot')
			.attr('transform','translate('+M.l+','+M.t+')');
		plot.select('.line').transition()
			.attr('d',line);
		plot.select('.axis-y').transition()
			.call(axisY);
		plot.select('.axis-x')
			.attr('transform','translate(0,'+H+')')
			.transition()
			.call(axisX);


	}

	//setting config values
	//"Getter" and "setter" functions
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
