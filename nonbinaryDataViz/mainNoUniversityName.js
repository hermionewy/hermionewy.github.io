'use strict';
(function() {
	// global variables
    var screenWidth = window.innerWidth;
    console.log(screenWidth);
    var axisData =['WHITE','BLACK','INTERNATIONAL','HISPANIC','ASIAN','OTHERS'];
    var color = {
        'WHITE': '#ddd',
        'BLACK': 'gold',
        'INTERNATIONAL': '#0076D1',
        'HISPANIC': '#ddd',
        'ASIAN': '#ddd',
        'OTHERS':'#ddd'
    };
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
    var margin = {top: 20, right: 50, bottom: 30, left: 20},
        width =  (document.getElementById('container').clientWidth)  - margin.left - margin.right,
        height = document.getElementById('container').clientHeight - margin.top - margin.bottom;
    var simulation;
    var dataCircles96=[];
// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var svg = d3.select("#container").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var axisYData = ['Boston University', 'Northeastern University','Harvard University','Boston College','MIT'];
	// graphic code
    var scaleY= d3.scaleBand()
        .domain(axisData)
        .range([120, height]);
    var scaleX= d3.scaleBand()
        .domain(axisYData)
        .range([0, width]);


    d3.queue()
        .defer(d3.json,'assets/data96.json')
        .defer(d3.json,'assets/data15.json')
        .await(dataloaded);

    drawAxis(); //drawAxis

    function dataloaded(err, data96, data15) {
		//console.log(data96[0];
        //console.log(joinData(data));
        var dataCircles96 = joinData(data96);
        var dataCircles15 = joinData(data15);
        var allCirclesData= addAttrToCircles(dataCircles96, dataCircles15);
        console.log(allCirclesData);

        var fiveSchools= allCirclesData.filter(function (t) {
            return selectedSchool(t.name);
        });

        console.log(fiveSchools);
        simulation= d3.forceSimulation(fiveSchools);

        var forceX =d3.forceX().x(function (d) {
            var index = axisYData.indexOf(function () {
                return d.name;
            }());
            return (index+1)*width/5;
        }).strength(0.2);

        var forceY = d3.forceY().y(function (d) {
            return scaleY(d.attr.toUpperCase());
        }).strength(0.1);
        var forceY15 = d3.forceY().y(function (d) {
            return scaleY(d.newattr.toUpperCase());
        }).strength(0.2);

        function colorOld(d) {
            return color[d.attr.toUpperCase()];
        }
        function colorNew(d) {
            return color[d.newattr.toUpperCase()];
        }

        ForceLayout(fiveSchools,forceX, forceY15, colorNew);


        d3.select('#year96').on('click', function () {
			console.log(1996);
            ForceLayout(fiveSchools, forceX,forceY, colorOld);

        });
        d3.select('#year15').on('click', function () {
            console.log(2015);
            ForceLayout(fiveSchools, forceX, forceY15, colorNew);
        });


    }



    function ForceLayout(data, forceX, forceY, colorByRace) {
        drawChart(data,colorByRace);

        simulation
            .force("collide",d3.forceCollide( function(d){return d.r}).radius(5).strength(2) )
            .force("charge", d3.forceManyBody().strength(0.5))
            .force('y', forceY)
            .force('x', forceX)
            .restart()
            .alpha(1)
            .on('tick', ticked);
        //return simulation;
        function ticked() {
            d3.selectAll('.circleNode')
                .attr('cx',function(d){
                    return (d.x)?(d.x):width/2 })
                .attr('cy',function(d){ return (d.y)?(d.y):height/2 });
        }
    }

	function drawChart(data, colorByRace) {
        console.log(data);

        var node = svg.selectAll('.node')
            .data([1]);

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node');

        var circles = nodeEnter.merge(node).selectAll('.circleNode')
			.data(data) //500 objects
			.enter();

        var circlesUpdate = circles
			.append('circle')
			.attr('class','circleNode');

        d3.selectAll('.circleNode')
            .attr('r', 5)
            .attr('fill', colorByRace);

        d3.selectAll('.circleNode')
            .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragend));
		circles.exit().remove();

    }

    function dragStarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    function dragend(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function joinData(data) { // all circles for all school
        var arr = [];
        for (var i =0; i<data.length; i++){
            arr = arr.concat(createCircleData(data[i]));
        }
        return arr;

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

    function addAttrToCircles(data96, data15) {
        for( var i=0; i< data96.length; i++){
            data96[i].newattr = (data15[i])?data15[i].attr :'others';
            data96[i].newId= (data15[i])?data15[i].id : 1;
        }
        return data96;
    }

    function createCircleData (data) {
        var arr=[];
        for (var attr in data){
            if(attrInCategory(attr)){
                for(var j=0;j<data[attr]*100; j++){
                    arr.push( {
                        name: data.name,
                        attr: attr,
                        id: j+1
                    } );
                }
            }
        }
        return arr;
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

        var axisx = d3.axisTop()
            .scale(scaleX)
            .tickSize(-width);
        svg.append('g')
            .attr('class','xAxis')
			.attr('transform','translate(120,50)')
            .call(axisx);
    }
    function selectedSchool(string) {
        var selectedSchool=false;
        for( var i=0; i<axisYData.length; i++){
            if(axisYData[i] == string){
                selectedSchool = true;
            }
        }
        return selectedSchool;
    }




	// run code
	init();
})();
