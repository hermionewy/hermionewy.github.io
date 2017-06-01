function radarDraw(){
  console.log('DrawRadar');
  function exports(selection){

    // var plot = selection
    //     .append('svg')
    //     .attr('width', w + m.l + m.r)
    //     .attr('height', h + m.t + m.b)
    //     .append('g').attr('class','plot')
    //     .attr('transform','translate('+ m.l+','+ m.t+')');
    var svg = selection.selectAll('svg').data([1]);
    var svgEnter = svg.enter()
        .append('svg')
        .attr('width', w+m.l+m.r)
        .attr('height', h+m.t+m.b);

      svgEnter.append('g').attr('class','plot')
        .attr('transform','translate('+ m.l+','+ m.t+')');

    var plot = svg.merge(svgEnter).selectAll('.plot');

    var allAxis = attrB.map(function(i){return i}),	//Names of each axis
        totalP = allAxis.length,					//The number of different axes
        angleSlice = Math.PI * 2 / totalP;			//The width in radians of each "slice"
    var radius = cfg.radius,
        maxValue =1;
    var rScale = d3.scaleLinear()
        .range([5, radius])
        .domain([0, maxValue]);
    var radarScale = d3.scaleLinear()
        .range([5, radius])
        .domain([177, 1]);

    var arr = selection.datum()?selection.datum():[];
    console.log(arr);
    var axisRadar0 = plot.selectAll('.axisRadar').data([1]);
    var axisRadar1 = axisRadar0
          .enter()
          .append("g")
          .attr("class", "axisRadar")
          .attr('transform','translate('+ m.l+','+ m.t+')');
    var axisRadar = axisRadar1.merge(axisRadar0);
  //append circles
    var allCircles = axisRadar.selectAll(".gridCircle")
        .data([1,2,3,4,5]);
    var allCirclesEnter = allCircles.enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function(d, i){return cfg.radius/cfg.levels*d;})
        .attr('cx', w/3)
        .attr('cy', h/3)
        .style("fill", "none")
        .style("stroke", cfg.colorLines)
        .style("fill-opacity", cfg.opacityCircles)
        .style('stroke-dasharray', ('2, 4'));
  //append text labels 0.2 0.4...1
    var labels = axisRadar.selectAll(".axisLabelStroke")
        .data(d3.range(0,(cfg.levels)).reverse());
    var labelsEnter = labels
        .enter()
        .append("text")
        .attr("class", "axisLabelStroke")
        .attr("x", w/3)
        .attr("y", function(d){return d*cfg.radius/cfg.levels-28;})
        .attr("dy", "0.4em")
        .text(function(d,i) { return (d/cfg.levels).toFixed(2)*100 + '%'});


    var axisProperty0 = axisRadar.selectAll(".axisProperty")
        .data([1]);
    var axisProperty1 = axisProperty0
        .enter()
        .append("g")
        .attr("class", "axisProperty");
    var axisProperty = axisProperty1.merge(axisProperty0);

    //Append the lines
    var lineGroup = axisProperty.selectAll("line")
        .data(allAxis);
    var lineGroupEnter = lineGroup.enter()
        .append("line")
        .attr("x1", w/3)
        .attr("y1", h/3)
        .attr("x2", function(d, i){ return w/3+rScale(maxValue) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){ return h/3+rScale(maxValue) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "spiderLine")
    //.attr("transform","rotate(13)");

    //Append the labels at each axisProperty
    var legends = axisProperty.selectAll('.legend')
        .data(allAxis);
        legends
        .enter()
        .append("text")
        .attr("class", "legend")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i){ return w/3+rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return h/3+rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d){return d})
        .call(wrap, cfg.wrapWidth);


    //append Radar path
      var radarPath = d3.radialLine()
          .radius(function(d) {
              return radarScale(d.value); })
          .angle(function(d,i) {	return i*angleSlice; });

    var radarPathSelect = axisRadar
            .selectAll('.radarPaths')
            .data([1]);
    var radarPathSelectEnter = radarPathSelect.enter()
            .append('g')
            .attr('class','radarPaths')
            .attr('transform','translate('+w/3+','+h/3+')');

    var paths = radarPathSelectEnter
            .append("path")
            .attr("class", "radarPathLine");
    var allPath = radarPathSelect.merge(radarPathSelectEnter).select('.radarPathLine');
        allPath
            .datum(arr.values)
            .attr("d", radarPath)
            .style("opacity",0)
            .transition()
            .delay(100)
            .duration(1500)
            .style("opacity",1);
        //add "Z" to close the path
        allPath
        .attr("d", allPath.attr("d") + " Z");

    var smallCircles = axisRadar.selectAll('.smCircles').data([1]);
    var smallCirclesEnter = smallCircles
        .enter()
        .append('g')
        .attr('class','smCircles');

    var smCircles = smallCirclesEnter.merge(smallCircles)
          .selectAll('.circleDesp')
          .data(arr.values);
    var smCirclesEnter = smCircles
          .enter()
          .append('circle')
          .attr('class','circleDesp')
          .attr("r", 0)
          .attr("cx",w/3)
          .attr("cy", h/3);

      smCirclesEnter.merge(smCircles)
          .transition()
          .duration(1000)
          .attr('cx', function(d, i){ return w/3+radarScale(d.value)*Math.cos(angleSlice*i - Math.PI/2)})
          .attr('cy', function(d, i){ return h/3+radarScale(d.value)*Math.sin(angleSlice*i - Math.PI/2)})
          .attr('r',cfg.dotRadius)
          .style('fill','gold');

      smCirclesEnter.merge(smCircles)
          .on("mouseover",function(d,i){
              d3.select(this).attr("r",7);
              var tooltip = d3.select(".custom-tooltip");
              tooltip.select(".title").html(attrA[d.axis] + "<br/><b>Rank:</b> "+d.value);
              var xy = d3.mouse(selection.node());
              var left = xy[0]+m.l+30,
                  top = xy[1]+h/3+m.t+30;

              d3.select(".custom-tooltip")
                  .style("left", (left)+ "px")
                  .style("top", top+ "px")
                  .style("display","inherit");
          })
          .on("mouseleave",function(d){
              d3.selectAll(".circleDesp").attr("r", cfg.dotRadius);
              d3.select(".custom-tooltip")
                  .style("display","none");
          });
  }

  function wrap(text, width) {
      text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.4, // ems
              y = text.attr("y"),
              x = text.attr("x"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
          }
      });
  }//wrap
  return exports;
}
