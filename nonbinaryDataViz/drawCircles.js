'use strict';
(function() {
	// global variables


	// called once on page load
	var init = function() {

	};

	// called automatically on article page resize
	window.onResize = function(width) {

	};

	// called when the graphic enters the viewport
	window.enterView = function() {

	};

// Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 50, bottom: 30, left: 50},
        width =  (document.getElementById('container').clientWidth)  - margin.left - margin.right,
        height = document.getElementById('container').clientHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select("#container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var axisData =['WHITE','BLACK','INTERNATIONAL','HISPANIC','ASIAN','OTHERS'];
	// graphic code
    var scaleY= d3.scaleBand()
        .domain(axisData)
        .range([120, height-50]);
	var color = 'gold';
    d3.queue()
        .defer(d3.json,'assets/data96.json')
        .defer(d3.json,'assets/data15.json')
        .await(dataloaded);

    drawAxis(); //drawAxis

    function dataloaded(err, data96, data15) {
		//console.log(data96[0];
    	drawChart(data15[0]);


    }


	function attrInCategory(attr) {
    	var inCategory = false;
		for (var i=0; i<axisData.length; i++){
			if(axisData[i].toLowerCase() == attr){
				inCategory = true;
			}
		}
		return inCategory;
    }

    function createCircleData (data) {
        var arr=[];
        for (var attr in data){
            if(attrInCategory(attr)){
                for(var j=0;j<data[attr]*100; j++){
                    arr.push( {
                        name: attr,
                        id: j+1
                    } );
                }
            }
        }
        return arr;
    }

	function drawChart(data) {
		//var data =
		console.log(data);


        var simulation = d3.forceSimulation()
            .force("collide",d3.forceCollide( function(d){return d.r}).radius(5).strength(1.5) )
            .force("charge", d3.forceManyBody().strength(5))
            .force('y', d3.forceY().y(function (d) {
                return scaleY(d.name.toUpperCase());
            }).strength(0.3))
            .force('x', d3.forceX().x(function (d) {
                return width/2;
            }).strength(0.2));

		var hundred = createCircleData(data);

		console.log(hundred);

        var node = svg.selectAll('g.node')
            .data([1]);

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node');

        var circles = nodeEnter.merge(node).selectAll('.circleNode')
			.data(hundred)
			.enter();

        var circlesUpdate = circles
			.append('circle')
			.attr('class','circleNode')
			.attr('r', 5)
			.attr('fill', color);

        // function ticked() {
        //
        // }
        var sim = simulation
            .nodes(hundred)
			.on('tick', ticked);


        function ticked() {
            d3.selectAll('circle')
                .attr('cx',function(d){
                	return (d.x)?(d.x):0 })
                .attr('cy',function(d){ return (d.y)?(d.y):0 });
        }

    }

	function drawAxis() {
        var axisCategory = d3.axisLeft()
            .scale(scaleY)
            .tickSize(-width);
        svg.append('g')
            .attr('class','categoryAxis')
            .attr('transform','translate(100,-40)')
            .style('stroke-dasharray', ('6, 3'))
            .call(axisCategory);
    }





	// run code
	init();
})();
