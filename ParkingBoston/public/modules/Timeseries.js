function Timeseries(){

	var T0 = new Date(2016,1,1),
		T1 = new Date(2016,12,31);
	var _interval = d3.timeDay;
	var _accessor = function(d){
		return d.time;
	};

	var W, H, M ={t:30,r:40,b:30,l:40};
	var scaleX, scaleY;
	var _dispatcher = d3.dispatch('timerange:select');


	var exports = function(selection){
		//Set initial internal values
		//Some of these will be based on the incoming selection argument
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var arr = selection.datum()?selection.datum():[];

		//Histogram layout
		//The value, domain and threshold properties are internal to this function
		var histogram = d3.histogram()
			.value(_accessor)
			.domain([T0,T1])
			.thresholds(_interval.range(T0,T1,1));

		var dayBins = histogram(arr);

		var maxY = d3.max(dayBins,function(d){return d.length});
		scaleX = d3.scaleTime().domain([T0,T1]).range([0,W]),
		scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);

		//Represent
		//Axis, line and area generators
		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(d.length)})
      .curve(d3.curveBasis);

		var area = d3.area()
			.x(function(d){return scaleX(d.x0)})
			.y0(function(d){return H})
			.y1(function(d){return scaleY(d.length)})
      .curve(d3.curveBasis);
		var axisX = d3.axisBottom()
			.scale(scaleX)
			.ticks(d3.timeMonth.every(3));
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(6);

		//Set up the DOM structure like so:
		/*
		<svg>
			<g class='plot'>
				<path class='area' />
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
		plotEnter.append('path').attr('class','area');
		plotEnter.append('g').attr('class','axis axis-y');
		plotEnter.append('path').attr('class','line');
		plotEnter.append('g').attr('class','axis axis-x');
		plotEnter.append('g').attr('class','brush');

		//Update
		var plot = svg.merge(svgEnter)
			.select('.plot')
			.attr('transform','translate('+M.l+','+M.t+')');

		var clipRect = d3.select(plot.node().parentNode)
				.append('defs')
				.append('clipPath').attr('id','view-port')
				.append('rect')
				.attr('width',W/2)
				.attr('height',H);

		var pointer = plot.append('circle')
				.attr('class','pointer')
				.attr('fill','rgb(80,80,80)')
				.attr('r',3)
				.style('opacity',0);

				//Append a rect as mouse target
		var bisectDate = d3.bisector(function(d){return d.x0}).right;

		var tooltip = d3.select('.container')
		.append('div').attr('class','custom-tooltip');
		tooltip.append('p').attr('class','heading');
		tooltip.append('p').attr('class','value');

		plot.select('.area').transition()
			.attr('d',area);
		plot.select('.line').transition()
			.attr('d',line)
			.attr('clip-path','url(#view-port)');
		plot.select('.axis-y').transition()
			.call(axisY);
		plot.select('.axis-x')
			.attr('transform','translate(0,'+H+')')
			.transition()
			.call(axisX);


			plot.append('rect')
					.attr('x',0).attr('y',0)
					.attr('width',W)
					.attr('height',H).attr('class','mouse-target')
					.style('opacity',0)
					.on('mouseenter',function(){
						console.log('timeseries:mouseenter');
						var tooltip = d3.select('.custom-tooltip')
							.style('visibility','visible')
							.transition()
							.style('opacity',1);
						pointer.style('opacity',1);
					})
					.on('mousemove',function(){
						var plotX = d3.mouse(this)[0],
							mouseX = d3.mouse(d3.select('.container').node())[0],
							mouseY = d3.mouse(d3.select('.container').node())[1],
							time = scaleX.invert(plotX);
						//what would the right insertion point?
						var i = bisectDate(dayBins, time),
							targetBin = dayBins[i];
						//Given this insertion point
						var x = scaleX(new Date((targetBin.x0.valueOf()+targetBin.x1.valueOf())/2)),
							y = scaleY(targetBin.length);

						pointer
							.attr('cx', x)
							.attr('cy', y);

						clipRect.attr('width',plotX);

						tooltip
							.style('left',(mouseX-100)+'px')
							.style('top',(mouseY+50)+'px')
							.select('.heading')
							.html((targetBin.x0.getMonth()+1)+'/'+targetBin.x0.getDate()+'/'+targetBin.x0.getFullYear() );

						tooltip
							.select('.value')
							.html('There are '+ targetBin.length + ' MV accidents happend in Boston.');

					})
					.on('mouseleave',function(){
						var tooltip = d3.select('.custom-tooltip')
							.style('visibility','none')
							.style('opacity',0);

						pointer.style('opacity',0);
						clipRect.attr('width',0);
					});
}

	//setting config values
	//"Getter" and "setter" functions
	exports.domain = function(_){
		if(!arguments.length) return [T0,T1];
		T0 = _[0];
		T1 = _[1];
		return this;
	}

	exports.interval = function(_){
		_interval = _;
		return this;
	}

	exports.value = function(_){
		if(!arguments.length) return _accessor;
		_accessor = _;
		return this;
	}

	exports.on = function(){
		_dispatcher.on.apply(_dispatcher,arguments);
		return this;
	}

	return exports;
}
