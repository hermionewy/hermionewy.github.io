function CasesByHour(){

	var W, H, M ={t:30,r:40,b:30,l:40};
	var _interval= 1/2;

	var exports = function(selection){

		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var R_MAX = H/2<W/2? (H/2-50):(W/2-50);
		var INNERR_AXIS=R_MAX/4;


		var histogramHour = d3.histogram()
			.domain([0,24])
			.value(function(d){return d.time.getHours() + d.time.getMinutes()/60})
			.thresholds(d3.range(0,25,_interval));
		var arr0 = selection.datum()?selection.datum():[];
		var arr = arr0.filter(function(d){
				if(d.time.getHours()+ d.time.getMinutes()){
					return d;
				}});

		var scaleX = d3.scaleLinear().domain([0,12]).range([0,Math.PI*2]),
				scaleY = d3.scaleLinear().domain([0,d3.max(histogramHour(arr), function(d){return d.length})]).range([INNERR_AXIS,R_MAX]);

		var svg = selection.selectAll('svg')
						.data([1]);

		var svgEnter = svg.enter()
						.append('svg') //ENTER
						.attr('width', W + M.l + M.r)
						.attr('height', H + M.t + M.b);

		var plotEnter = svgEnter.append('g').attr('class','plot time-series')
						.attr('transform','translate('+M.l+','+M.t+')');


		// scaleY.domain([0,d3.max(histogramHour(arr), function(d){return d.length})]).range([60,R_MAX]);
		// scaleX.domain([0,12]).range([0,Math.PI*2]);

		var radialArea = d3.radialArea()
			.angle(function(d){return scaleX(d.x0)})
			.innerRadius(INNERR_AXIS)
			.outerRadius(function(d){return scaleY(d.length)})
			.curve(d3.curveBasis);

		var radialPlot = plotEnter.append('g').attr('class','plot-radial')
			.attr('transform','translate('+W/2+','+H/2+')');
		//AM trips
		radialPlot
			.append('path').attr('class','area am')
			.datum(histogramHour(arr).filter(function(bin){return bin.x0<=12}))
			.attr('d',radialArea);
		radialPlot
			.append('path').attr('class','line am-line')
			.datum(histogramHour(arr).filter(function(bin){return bin.x0<=12}))
			.attr('d',radialArea.lineOuterRadius())
		//PM trips
		radialPlot
			.append('path').attr('class','area pm')
			.datum(histogramHour(arr).filter(function(bin){return bin.x0>=12}))
			.attr('d',radialArea);
		radialPlot
			.append('path').attr('class','line pm-line')
			.datum(histogramHour(arr).filter(function(bin){return bin.x0>=12}))
			.attr('d',radialArea.lineOuterRadius());

		//Radial axis
		//"y-axis" corresponds to the radius
		var radialPlotAxes = plotEnter.insert('g','.plot-radial').attr('class','axis-radial')
			.attr('transform','translate('+W/2+','+H/2+')');
		radialPlotAxes
			.selectAll('.tick-y')
			.data(d3.range(0,5*R_MAX/4,R_MAX/4))
			.enter()
			.append('circle').attr('class','tick-y')
			.classed('major', function(d){
				if(d%(R_MAX/2)===0) return true;
			})
			.attr('r',function(d){return d});

		//"x-axis" corresponds to the angle
		radialPlotAxes
			.selectAll('.tick-x')
			.data(d3.range(0,24,1))
			.enter()
			.append('g')
			.attr('class',function(d){
				return 'tick-x ' + (d>=12?'pm':'am');
			})
			.attr('transform',function(d){
				var angle = scaleX(d)*180/Math.PI-90;
				return 'rotate('+angle+')'
			})
			.append('line')
			.attr('x1',R_MAX)
			.attr('x2',function(d){
				return d>=12?(R_MAX+10):(R_MAX-10);
			})
			.select(function(){
				return this.parentNode;
			})
			.append('text')
			.attr('text-anchor',function(d){
				return d>=12?'start':'end'
			})
			.attr('x',R_MAX)
			.attr('dx',function(d){return d>=12?20:-20})
			.attr('dy',4)
			.text(function(d){
				return d+':00'
			})
	}
	exports.interval = function(_){
			_interval = _;
			return this;
		}
	return exports;
}
