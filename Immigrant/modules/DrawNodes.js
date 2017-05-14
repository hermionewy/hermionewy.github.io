function DrawNodes(){
  console.log('DrawNodes');
  var _data;
  var simulation;
  var _x,_y,_tran=[0,0];
  var timer;
  //var colorOcp = ['#F25F5C','#FFE066','#247BA0','#70C1B3','#50514F','#EF6E81','#FFB491','#DBC2CF','#9FA2B2','#3C7A89','#9CEC5B' ];
  var _color = 'red';
  function exports(selection){
    _data = selection.datum()?selection.datum():[];

    var gCircle = selection.selectAll('.nodes')
        .data([1]);
    var gCircleEnter = gCircle
        .enter()
        .append('g')
        .attr('class', 'nodes')
        .attr('transform','translate('+_tran[0]+','+_tran[1]+')');
    var circles = gCircle.merge(gCircleEnter)
        .selectAll('.circle')
        .data(_data);
    var circlesEnter = circles.enter()
        .append('circle')
        .attr('class','circle');
    var AllCircles = gCircle.merge(gCircleEnter)
        .selectAll('.circle')
        .attr('r', function (d) { return (+scaleR(d.num))?(+scaleR(d.num)):0; })
        .style('fill', _color)
        .style('opacity',.6)
        .on('mouseenter',function(d){

        });

    circles.exit().remove();

      var forceCollide = d3.forceCollide()
        .radius(function(d){return scaleR(d.num)});
      var charge = d3.forceManyBody().strength(2);
      var forceX = d3.forceX().x(_x),
          forceY = d3.forceY().y(_y);
      if (!simulation) {
              simulation = d3.forceSimulation(_data);
            }

      var forceSimulation = simulation
              .restart()
              .alpha(1)
              .force('forceX',forceX)
              .force('forceY',forceY)
              .force('charge',charge)
              .force('collide',forceCollide)
              .on('tick',forceTick)
              .on('end',function(){
                    console.log('simulation end');
              });
      function forceTick(){
        AllCircles
            .attr('cx',function(d){ return (d.x)?(d.x):0 })
            .attr('cy',function(d){ return (d.y)?(d.y):0 });
      }
  }
  exports.x = function(_){
    if(!arguments.length) return 0;
    _x=_;
    return this;
  }
  exports.y = function(_){
    if(!arguments.length) return 0;
    _y=_;
    return this;
  }
  exports.trans = function(_){
    if(!arguments.length) return 0;
    _tran = _;
    return this;
  }
  exports.color = function(_){
    if(!arguments.length) return '#0990C6';
    _color =_;
    return this;
  }
  // exports.start = function() {
	// 	if (timer) {
	// 		timer.stop(); // to remove the previous timer
	// 	}
	// 	timer = d3.timer(this, 0);
	// 	return this;
	// }
  //
	// exports.stop = function() {
	// 	if (timer) {
	// 		timer.stop();
	// 	}
	// }
  return exports;
}
