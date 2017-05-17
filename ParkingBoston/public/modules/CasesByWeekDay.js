function CasesByWeekDay(){

	var W, H, M ={t:30,r:40,b:30,l:40};

	var exports = function(selection){

		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
    var arr= selection.datum()?selection.datum():[];
    var num=[];
 	  for (var i=0; i<7; i++){
 		 num[i] = arr.filter(function(d){ return d.time.getDay() == i}).length;
 	  }
    console.log(num);
    var scaleY = d3.scaleLinear().domain([0,6]).range([(1/5)*H,(4/5)*H]);
		var scaleX = d3.scaleLinear().domain([0,d3.max(num,function(d){return d})]).range([0,W]);
    var color =  d3.scaleLinear().domain([0,6])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("#007AFF"), d3.rgb('#ffc31e')]);
    var svg = selection.selectAll('svg')
            .data([1]);
    var dayWeek=['SUN','MON','TUE','WED','THU','FRI','SAT'];
    var svgEnter = svg.enter()
            .append('svg') //ENTER
            .attr('width', W + M.l + M.r)
            .attr('height', H);

    var plotEnter = svgEnter.append('g').attr('class','dayofweek')
						.attr('transform','translate(0, -40)');

      plotEnter.selectAll('.chart')
      .data(num)
      .enter()
      .append('rect').attr('class','chart')
      .attr('width', function(d) { return scaleX(d) + 'px'; })
      .attr('height', '20px')
      .attr('x',0)
      .attr('y',function(d,i) { return scaleY(i) + 'px'; })
      .style('fill',function(d,i){ return color(i)})
      .style('opacity','.9');

      plotEnter.selectAll('text')
      .data(num)
      .enter()
      .append('text')
      .attr('x','10px')
      .attr('y',function(d,i) { return (scaleY(i)+14) + 'px'})
      .text(function(d,i){ return dayWeek[i]+': '+num[i]})
      .style('fill','white');

	}
	return exports;
}
