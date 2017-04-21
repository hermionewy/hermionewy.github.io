function timeSlider(){
  console.log('timeSlider is working!');
  var _dispatcher = d3.dispatch('timeline');
  var W,H,M={t:15,l:15,b:15,r:15};
  var exports = function(selection){
    console.log('slider');
    var W = selection.node().clientWidth-M.l-M.r,
        H= selection.node().clientHeight-M.t-M.b;
    var brush = d3.brushX()
        .extent([[0, 0], [W, H]])
        .on('end', brushend);
    var scaleX = d3.scaleTime().domain([new Date(2016,0,1),new Date(2017,0,1)]).rangeRound([0,W]);
    var axisX = d3.axisBottom()
      .scale(scaleX)
      .ticks(d3.timeMonth.every(2))
      .tickSize(-H);
    var sliderSvg= selection.append('svg').attr('width',W+M.l+M.r).attr('height',H+M.t+M.b).append('g').attr('transform','translate('+M.l+','+(M.t)+')');
    sliderSvg.append('g').attr('class','axis axis-x').attr('transform','translate('+0+','+H+')').call(axisX);
    sliderSvg.append('g').attr('class','brush').attr('width',W).attr('height',H);
    sliderSvg.select('.brush')
      .call(brush)
      .call(brush.move, [scaleX(new Date(2016,2,1)), scaleX(new Date(2016,4,1))]);

    function brushend(){
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) return; // Ignore empty selections.
      // var t0 = scaleX.invert(d3.event.selection[0]),
      //   t1 = scaleX.invert(d3.event.selection[1]);

      var  d0 = d3.event.selection.map(scaleX.invert),
        d1 = d0.map(d3.timeMonth.round);
        d3.select(this).transition().call(d3.event.target.move, d1.map(scaleX));

      _dispatcher.call('timeline',this,d1);
    }
  }
    exports.on = function(){
  	_dispatcher.on.apply(_dispatcher,arguments);
  	return this;
  }
  return exports;
}
