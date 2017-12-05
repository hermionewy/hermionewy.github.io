function Button(){

    var _map,
        _menu;

    function exports(selection){

        var datum = selection.datum() || [];

        //Draw axis Year
        nestByYear = d3.nest().key(function(d){return d.year})
            .entries(datum);

        year = nestByYear.map(function(d){return d.key});
        console.log(year);

        var nestByCategory = d3.nest().key(function(d){ return d.category}).entries(datum);
        console.log(nestByCategory[5]);
        var category = nestByCategory.map(function(d){ return d.key });

        var nestByOrg = d3.nest().key(function(d){ return d.org}).entries(datum);
        var scaleX = d3.scaleTime()
            .domain([new Date(1900, 0, 1), new Date(2020, 1, 1)])
            .range([100,W-100]);

        var axisX = d3.axisTop()
            .scale(scaleX)
            .ticks(d3.timeYear.every(10));

        var scaleY = d3.scaleBand()
            .domain(category)
            .range([120, H-50]);
        var axisCategory = d3.axisLeft()
            .scale(scaleY)
            .tickSize(-W);
        var scaleCategory = d3.scaleBand()
            .domain(category)
            .range([-25, 20]);

        //for animation
        //var maxAge = d3.max(datum, function(d){return d.age});
        var scaleAge = d3.scaleLinear().domain([0,100]).range([H-100,50]);
        var axisYearB = d3.axisBottom()
            .scale(scaleX)
            .ticks(d3.timeYear.every(10));
        var axisAge = d3.axisLeft()
            .scale(scaleAge)
            .ticks(10);

        plot.append('g')
            .attr('class','yearAxis')
            .attr('transform','translate(20,60)')
            .call(axisX);
        plot.append('g')
            .attr('class','yearBAxis')
            .attr('transform','translate(0,500)')
            .call(axisYearB);
        plot.append('g')
            .attr('class','ageAxis')
            .attr('transform','translate(100,0)')
            .call(axisAge);
        plot.append('g')
            .attr('class','categoryAxis')
            .attr('transform','translate(100,-40)')
            .style('stroke-dasharray', ('6, 3'))
            .call(axisCategory);

        //Draw map
        projection.fitExtent([[0,0],[W,H]],_map)
            .scale(190);

        plot.append('g')
            .attr('class','mapData')
            .attr('transform','translate(0,0)')
            .selectAll('.countries')
            .data(_map.features)
            .enter()
            .append('path')
            .attr('class','countries')
            .attr('d',path)
            .style('stroke-width','1px')
            .style('stroke','rgba(255, 225, 74,0.5)')
            .style('opacity',0.8);


        //Simulation Setting
        //scale and force for year
        var yearPosition = function(d){
            if(!d.year){return -500;
            }else{
                return scaleX(new Date().setYear(d.year))}
        }

        var categoryPosition = function(d){
            for( var j=1; j<category.length; j++){
                if(!d.category){ return -500;
                }else {
                    return (scaleY(d.category)+scaleY.bandwidth()-scaleY.bandwidth()*1.2*(d.age/100));
                }
            }
        }
        var categoryPosition2 = function(d){
            for( var j=1; j<category.length; j++){
                if(!d.category){ return -500;
                }else {
                    return (H/3+scaleY(d.category)*0.15);
                }
            }
        }
        var yearBPosition = function(d){
            if(!d.year){return -500;
            }else{
                return scaleX(new Date().setYear(d.year))}
        }
        var agePosition = function(d){
            if(!d.age){return -500;
            }else{
                return scaleAge(d.age)}
        }

        //force for map
        map = d3.map(_map.features,function(d){return d.properties.name});
        var xMap = function(d){

            if (map.get(d.birthCtr)) {
                return path.centroid(map.get(d.birthCtr).geometry)[0]+scaleCategory(d.category);
            }
            return -100;
        }
        var yMap = function(d){
            if (map.get(d.birthCtr)) {
                return path.centroid(map.get(d.birthCtr).geometry)[1]+35;
            } else {
                return 600  ;
            }
        }
        var xMap2 = function(d){

            if (map.get(d.deathCtr)) {
                return path.centroid(map.get(d.deathCtr).geometry)[0]+scaleCategory(d.category);
            }
            return -100;
        }
        var yMap2 = function(d){
            if (map.get(d.deathCtr)) {
                return path.centroid(map.get(d.deathCtr).geometry)[1]+35;
            } else {
                return 600 ;
            }
        }
        //color director
        var scaleCy = d3.scaleBand()
            .domain(category)
            .range([0, 100]);

        var colorPlot = d3.select('.colorDirector')
            .append('svg')
            .attr('width',200)
            .attr('height',100)
            .append('g')
            .attr('transform','translate(0,10)');
        colorPlot
            .selectAll('.colorCircle')
            .data(category)
            .enter()
            .append('circle')
            .attr('class','colorCircle')
            .attr("cx", 30)
            .attr("cy", function (d) { return scaleCy(d); })
            .attr("r", 4)
            .style("fill", function(d) { return colors[d]});
        colorPlot
            .selectAll('.text')
            .data(category)
            .enter()
            .append("text")
            .attr('class','text')
            .attr('dx',50)
            .attr('dy',function (d) { return scaleCy(d)+4; })
            .style('fill', 'rgb(136, 125, 79)')
            .text(function(d){return d});

        //Scroll bar
        d3.select('#menu')
            .selectAll('li')
            .data(_menu)
            .enter()
            .append('li')
            .html(function(d){return d.key})
            .on('mouseenter',function(d){

                selectedMenu = d.key;
                forceLayout.selectEventNodes(selectedMenu);
                d3.select('.orgs').style('opacity',1);
                d3.select('.orgsDes').html(d.values.length + ' winners worked at '+ d.key +'.');

            })
            .on('mouseleave',function(d){
                d3.select('.orgs').style('opacity',0);
                forceLayout.deselectEventNodes();
            });
        //Scroll
        $(function(){
            var div = $('div.sc_menu'),
                ul = $('ul.sc_menu'),
                ulPadding = 15;

            var divWidth = div.width();
            div.css({ overflow: 'hidden'});
            var lastLi = ul.find('li:last-child');
            div.mousemove(function(e){
                var ulWidth = lastLi[0].offsetLeft + lastLi.outerWidth()+ulPadding;
                //            console.log(ulWidth,lastLi[0].offsetLeft,lastLi.outerWidth() );
                var left = (e.pageX - div.offset().left)*(ulWidth-divWidth)/divWidth;
                div.scrollLeft(left);
            });
        });

        d3.select('.button1').classed('clickedBtn',true);
        selectedGroupBtn = 'When';
        //button
        d3.selectAll('.yearAxis').style('opacity',1);
        d3.selectAll('.categoryAxis').style('opacity',1);
        d3.selectAll('.sc_menu').style('opacity',1).style('visibility','visible');
        d3.select('.hint').style('visibility','visible');

        forceByYear = forceLayout
            .x(yearPosition)
            .y(categoryPosition)
            .r(r-1)
            .collide(r-1)
            .strength(0);

        d3.select('#container').datum(datum).call(forceByYear);

        d3.select('.button1')
            .on('click.year',function(d){
                d3.select('.button2').classed('clickedBtn',false);
                d3.select('.button3').classed('clickedBtn',false);
                d3.select(this).classed('clickedBtn',true);

                selectedGroupBtn = 'When';

                //button
                d3.selectAll('.yearAxis').style('opacity',1);
                d3.selectAll('.categoryAxis').style('opacity',1);
                d3.selectAll('.mapData').style('opacity',0);
                d3.selectAll('.yearBAxis').style('opacity',0);
                d3.selectAll('.ageBAxis').style('opacity',0);
                d3.select('.colorDirector').style('visibility','hidden');
                d3.selectAll('.sc_menu').style('opacity',1).style('visibility','visible');
                d3.select('.hint').style('visibility','visible');

                forceByYear = forceLayout
                    .x(yearPosition)
                    .y(categoryPosition)
                    .r(r-1)
                    .collide(r-1)
                    .strength(0);

                d3.select('#container').datum(datum).call(forceByYear);

            });//When


        //Country, Where
        d3.select('.button2')
            .on('click.map',function(){
                d3.select('.button1').classed('clickedBtn',false);
                d3.select('.button3').classed('clickedBtn',false);
                d3.select(this).classed('clickedBtn',true);

                selectedGroupBtn = 'Where';
                d3.selectAll('.mapData').style('opacity',1);
                d3.selectAll('.yearAxis').style('opacity',0);
                d3.selectAll('.categoryAxis').style('opacity',0);
                d3.selectAll('.yearBAxis').style('opacity',0);
                d3.selectAll('.ageBAxis').style('opacity',0);
                d3.select('.hint').style('visibility','visible');
                d3.select('.colorDirector').style('visibility','visible');
                d3.selectAll('.sc_menu').style('opacity',1).style('visibility','hidden');

                forceByCountry = forceLayout
                    .x(xMap)
                    .y(yMap)
                    .r(r-1)
                    .collide(r-1.5)
                    .strength(0);

                d3.select('#container').datum(datum).call(forceByCountry);

                d3.select('#birthCtr').on('click.birth',function(){
                    d3.select(this).classed('clickedCtr',true);
                    d3.select('#deathCtr').classed('clickedCtr',false);
                    forceByCountry = forceLayout
                        .x(xMap)
                        .y(yMap)
                        .r(r-1)
                        .collide(r-1.5)
                        .strength(0);

                    d3.select('#container').datum(datum).call(forceByCountry);
                });
                d3.select('#deathCtr').on('click.birth',function(){
                    d3.select(this).classed('clickedCtr',true);
                    d3.select('#birthCtr').classed('clickedCtr',false);
                    forceByCountry = forceLayout
                        .x(xMap2)
                        .y(yMap2)
                        .r(r-1)
                        .collide(r-1.5)
                        .strength(0);

                    d3.select('#container').datum(datum).call(forceByCountry);
                });

            });//Where

        //Death, How

        d3.select('.button3')
            .on('click.animation',function(){
                selectedGroupBtn = 'Animation';
                d3.select('.button1').classed('clickedBtn',false);
                d3.select('.button2').classed('clickedBtn',false);
                d3.select(this).classed('clickedBtn',true);

                d3.selectAll('.mapData').style('opacity',0);
                d3.selectAll('.yearAxis').style('opacity',0);
                d3.selectAll('.categoryAxis').style('opacity',0);
                d3.selectAll('.yearBAxis').style('opacity',1);
                d3.selectAll('.ageAxis').style('opacity',1);
                d3.select('.hint').style('visibility','visible');
                d3.select('.colorDirector').style('visibility','hidden');
                d3.selectAll('.sc_menu').style('opacity',0).style('visibility','hidden');

                var forceByAge = forceLayout
                    .x(yearBPosition)
                    .y(agePosition)
                    .r(r-1)
                    .collide(r-1)
                    .strength(-1);

                d3.select('#container').datum(datum).call(forceByAge);

            });//How


        //About
        var about = d3.select('.about');

        d3.select('.button4')
            .on('click',function(){
                about.style('display','block');
            });

        d3.select('.close')
            .on('click',function(){
                about.style('display','none');
            });

    }

    exports.map = function(_){
        if(!arguments.length) return _map;
        _map = _;
        return this;
    }

    exports.menu = function(_){
        if(!arguments.length) return _menu;
        _menu = _;
        return this;
    }


    return exports;
}
