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
    var data=[
        {'attr':'non-binary', }
    ];
// Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 50, bottom: 30, left: 20},
        width =  (document.getElementById('container').clientWidth)  - margin.left - margin.right,
        height = document.getElementById('container').clientHeight - margin.top - margin.bottom;
    var simulation;
// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select("#container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var axisData =['All','Non-binary'];
    var axisYData = ['Boston University'];
	// graphic code
    var scaleY= d3.scaleBand()
        .domain(axisData)
        .range([120, height]);
    var scaleX= d3.scaleBand()
        .domain(axisYData)
        .range([0, width]);

	var circledata = createData();

	function createData() {
        for(var i=0; i<100; i++){

        }
    }















	// run code
	init();
})();
