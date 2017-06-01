var margin = {t:50,l:5,b:5,r:5},
    chartW = document.getElementById('plot1').clientWidth-margin.l-margin.r,
    chartH = document.getElementById('plot1').clientHeight-margin.t-margin.b;

var margin2 = {top: 0, right: 0, bottom:0, left: 0},
    width2 = Math.min(700, window.innerWidth - 10) - margin2.left - margin2.right,
    height2 = Math.min(width2, window.innerHeight - margin2.top - margin2.bottom - 20);

var canvas1 = d3.select('#plot1');
var plot = canvas1
    .append('svg')
    .attr('width',chartW+margin.r+margin.l)
    .attr('height',chartH + margin.t + margin.b);

var marginDiscl = {t:80,l:50,b:50,r:50},
    chartWStateDiscl = document.getElementById('radarChartDiscl').clientWidth-marginDiscl.l-marginDiscl.r,
    chartHStateDiscl = document.getElementById('radarChartDiscl').clientHeight-marginDiscl.t-marginDiscl.b;

var canvasStateDiscl = d3.select('.radarChartDiscl');


var marginTransp = {t:80,l:50,b:50,r:50},
    chartWStateTransp = document.getElementById('radarChartTransp').clientWidth-marginTransp.l-marginTransp.r,
    chartHStateTransp = document.getElementById('radarChartTransp').clientHeight-marginTransp.t-marginTransp.b;

var canvasStateTransp = d3.select('.radarChartTransp');


var marginCorr = {t:80,l:50,b:50,r:50},
    chartWStateCorr = document.getElementById('radarChartCorrup').clientWidth-marginCorr.l-marginCorr.r,
    chartHStateCorr = document.getElementById('radarChartCorrup').clientHeight-marginCorr.t-marginCorr.b;

var canvasStateCorr = d3.select('.radarChartCorrup');
var plotDiscl = canvasStateDiscl
    .append('svg')
    .attr('width',chartWStateDiscl+marginDiscl.r+marginDiscl.l)
    .attr('height',chartHStateDiscl + marginDiscl.t + marginDiscl.b);

var plotTransp = canvasStateTransp
    .append('svg')
    .attr('width',chartWStateTransp+marginTransp.r+marginTransp.l)
    .attr('height',chartHStateTransp + marginTransp.t + marginTransp.b);

var plotCorr = canvasStateCorr
    .append('svg')
    .attr('width',chartWStateCorr+marginCorr.r+marginCorr.l)
    .attr('height',chartHStateCorr + marginCorr.t + marginCorr.b);



//load data
var queue = d3_queue.queue()
    //.defer(d3.csv,'data/data_index.csv',parse)
    .defer(d3.csv,'data/Disclosure-Components.csv',parseData)
    .defer(d3.csv,"data/Disclosure-Score.csv",parseScore)
    .defer(d3.csv,"data/Disclosure-Descriptions.csv",parseDescriptions)
    .defer(d3.csv,"data/States-abbreviations.csv",parseAbv)
    .defer(d3.csv,"data/Transparency-Components.csv",parseData)
    .defer(d3.csv,"data/Transparency-Score.csv",parseScore)
    .defer(d3.csv,"data/Transparency-Descriptions.csv",parseDescriptions)
    .defer(d3.csv,"data/Corruption-Components.csv",parseData)
    .defer(d3.csv,"data/Corruption-Score.csv",parseScore)
    .defer(d3.csv,"data/Corruption-Descriptions.csv",parseDescriptions)
    .defer(d3.csv,'data/map.csv',parseMap)
    .defer(d3.csv,"data/Financial_Disclosure-GovernorsForms.csv",parseForms)
    .defer(d3.csv,"data/disclosure-transparency-corruption-rankings.csv",parseAllRankings)
    .await(dataloaded);

function dataloaded (err, data, disclScore, disclDesc, abv, transpData,transpScore,transpDesc,corrData,corrScore,corrDesc,map,forms,allRankings){


    var maxminWidth = d3.extent(map.map(function (d,i) {return d.x}));
    var maxminHeight = d3.extent(map.map(function (d,i) {return d.y}));
    var maxminTransp = d3.extent(transpScore.map(function (d,i) {return d.score}));

    var size = 90;
    var scaleMapWidth = d3.scaleLinear().range([0,(chartW-size)]).domain(maxminWidth),
        scaleMapHeight = d3.scaleLinear().range([0,650]).domain(maxminHeight),
        scaleColorDiscl = d3.scaleLinear().range(["rgba(0,0,0,1)","rgba(0,0,0,0)"]).domain([0,1]),
        scaleColorTransp = d3.scaleLinear().range(["rgb(82, 0, 0)","rgb(235, 100, 100)"]).domain(maxminTransp);

    var nestedMap = d3.nest()
        .key(function(d){
            return d.state
        })
        .sortKeys(d3.ascending)
        .entries(map);

    var nestedDataDiscl = d3.nest()
        .key(function(d){
            return d.group
        })
        .sortValues(function(a,b){return a.id - b.id})
        .entries(data);


    var nestedDataCorr = d3.nest()
        .key(function (d) {
            return d.group
        })
        .sortValues(function(a,b){return a.id - b.id})
        .entries(corrData);

    //console.log(nestedDataCorr);

    plot.append('g').attr('transform','translate('+ margin.l+','+ margin.t+')').attr('class','map');

    var drawMap = plot.select(".map")
        .selectAll(".states")
        .data(nestedMap);

    drawMap = drawMap
        .enter()
        .append("g")
        .attr("class",function(d){
            return "states " + d.values[0].abv});

    drawMap
        .append("rect")
        .attr("class",function(d){
            return "statesBack statesBack" + d.values[0].abv})
        .attr("x",function(d){
            return scaleMapWidth(d.values[0].x)})
        .attr("y",function(d){return scaleMapHeight(d.values[0].y)})
        .attr("width",size)
        .attr("height",size)
        .style("fill","none")
        .style("stroke","none")
        .on("mouseleave",function(d){d3.select(this).attr("fill","#f7f7f7")})
        .on("mouseover",function(d){d3.select(this).attr("fill","none")});

    drawMap
        .append("text")
        .attr("class","statename")
        .text(function(d){
            return d.values[0].abv})
        .attr("x",function(d){
            return scaleMapWidth(d.values[0].x)})
        .attr("y",function(d){return scaleMapHeight(d.values[0].y)+15});

    drawMap
        .append("line")
        .attr("x1",function(d){
            return scaleMapWidth(d.values[0].x)+15})
        .attr("x2",function(d){
            return scaleMapWidth(d.values[0].x)+20})
        .attr("y1",function(d){return scaleMapHeight(d.values[0].y)+18})
        .attr("y2",function(d){return scaleMapHeight(d.values[0].y)+20})
        .style("stroke","black")
        .style("stroke-width","1pt");


    drawMap
        .append("line")
        .attr("x1",function(d){
            return scaleMapWidth(d.values[0].x)+20})
        .attr("x2",function(d){
            return scaleMapWidth(d.values[0].x)+18})
        .attr("y1",function(d){return scaleMapHeight(d.values[0].y)+20})
        .attr("y2",function(d){return scaleMapHeight(d.values[0].y)+16})
        .style("stroke","black")
        .style("stroke-width","1pt");

    nestedDataCorr.forEach(function (d, i) {

        var stateAbv,
            x,
            y,
            transpState;

        abv.forEach(function (e) {
            if (e.state == d.key) {
                return stateAbv = e.abv
            }
        });

        nestedMap.forEach(function (e) {
            if (e.key == d.key) {
                return x = e.values[0].x;
            }
        });

        nestedMap.forEach(function (e) {
            if (e.key == d.key) {
                return y = e.values[0].y;
            }
        });

        transpScore.forEach(function (e) {
            if (e.state == d.key) {
                return transpState = e.score;
            }
        });

        var cfg = {
            radius: size / 2,
            levels: 1,
            opacityCircles: 0.1,
            labelFactor: 1.25, //How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
        };

        plotChartCorr = d3.select("." + stateAbv);

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        var allAxis = ((d.values).map(function (i, j) {
                return i.axis
            })), //Names of each axis
            total = allAxis.length, //The number of different axes
            radius = cfg.radius, //Radius of the outermost circle
            angleSlice = Math.PI * 2 / total, //The width in radians of each "slice"
            maxValue = 1;

        //Scale for the radius
        var rScale = d3.scaleLinear()
            .range([5, radius])
            .domain([0, maxValue]);


        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        var radarLine = d3.radialLine()
            .radius(function (d) {
                return rScale(d.value);
            })
            .angle(function (d, i) {
                return i * angleSlice;
            });

        //Append the backgrounds
        plotChartCorr
            .append("path")
            .datum(d.values)
            .attr("class", function (d, i) {
                //console.log(d)
                return "spider radarAreaCorr " + "radarAreaCorr" + stateAbv
            })
            .attr("d", radarLine)
            .style("fill",scaleColorTransp(transpState))
            .on("click", mapClick)
            .on("mouseleave",mapLeave)
            .on("mouseover",mapOver);

        nestedMap.forEach(function (e) {
            if (d.key == e.key) {
                chartState = d3.select(".radarAreaCorr" + stateAbv);
                chartState.attr("transform", function (d) {
                    return "translate (" + (scaleMapWidth(x) + radius) + "," + (scaleMapHeight(y) + radius) + ")"
                })
            }
        });

    });


    //Disclosure
    nestedDataDiscl.forEach(function (d, i) {

                var stateAbv,
                    x,
                    y,
                    totalDiscl;

                abv.forEach(function (e) {
                    if (e.state == d.key) {
                        return stateAbv = e.abv
                    }
                });

                nestedMap.forEach(function (e) {
                    if (e.key == d.key) {
                        return x = e.values[0].x;
                    }
                });

                nestedMap.forEach(function (e) {
                    if (e.key == d.key) {
                        return y = e.values[0].y;
                    }
                });

                disclScore.forEach(function (e) {
                    if (e.state == d.key) {
                        return totalDiscl = e.score;
                    }
                });

                var cfg = {
                    radius: size / 2,
                    levels: 1,
                    scaleCircleCorr : d3.scaleSqrt().range([0,(size/2)]).domain([0,1]),
                    labelFactor: 1.25, //How much farther than the radius of the outer circle should the labels be placed
                    wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
                };

                plotChartDiscl = d3.select("." + stateAbv);

                /////////////////////////////////////////////////////////
                //////////////////// Draw the axes //////////////////////
                /////////////////////////////////////////////////////////

                var allAxis = ((d.values).map(function (i, j) {
                        return i.axis
                    })), //Names of each axis
                    total = allAxis.length, //The number of different axes
                    radius = cfg.radius, //Radius of the outermost circle
                    angleSlice = Math.PI * 2 / total, //The width in radians of each "slice"
                    maxValue = 1;

                //Scale for the radius
                var rScale = d3.scaleLinear()
                    .range([5, radius])
                    .domain([0, maxValue]);

                /////////////////////////////////////////////////////////
                ///////////// Draw the radar chart blobs ////////////////
                /////////////////////////////////////////////////////////

                //The radial line function
                var radarLine = d3.radialLine()
                    .radius(function (d) {
                        return rScale(d.value);
                    })
                    .angle(function (d, i) {
                        return i * angleSlice;
                    });

                //Append the backgrounds
                plotChartDiscl
                    .append("a")
                    .append("path")
                    .datum(d.values)
                    .attr("class", function (d, i) {
                        //console.log(d)
                        return "spider radarAreaDiscl " + "radarAreaDiscl" + stateAbv
                    })
                    .attr("d", radarLine)
                    //.style("fill",function(d){return scaleColorDiscl(totalDiscl)})
                    .style("stroke","black")
                    .on("mouseover",mapOver)
                    .on("mouseleave",mapLeave)
                    .on("click", mapClick);


                plotChartDiscl.select(".radarAreaDiscl").attr("d", plotChartDiscl.select(".radarAreaDiscl").attr("d") + " Z");

                var lineGif = "lines/"+(Math.round((1-totalDiscl) * 10)/10) + ".gif";

                //putting the GIFs
                 plotChartDiscl
                     .append("defs")
                    .append("pattern")
                    .attr("id","lineback"+stateAbv)
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width","100%")
                    .attr("height","100%")
                    .append("image")
                    .attr("width", size+"px")
                    .attr("height",size+"px")
                    .attr("xlink:href",lineGif);
                plotChartDiscl.select("path.radarAreaDiscl").attr("fill", "url(#lineback"+stateAbv+")");


                //forces Safari to play the GIFs
                //plotChartDiscl.node().focus();

                nestedMap.forEach(function (e) {
                    if (d.key == e.key) {
                        chartState = d3.select(".radarAreaDiscl" + stateAbv);
                        chartState.attr("transform", function (d) {
                            return "translate (" + (scaleMapWidth(x) + radius) + "," + (scaleMapHeight(y) + radius) + ")"
                        })

                    }
                });
    });


    function mapOver(d){
        var stateAbv;

        abv.forEach(function (e) {
            if (e.state == d.key) {
                return stateAbv = e.abv
            }
        });

        d3.select(".statesBack"+stateAbv).style("fill","#f7f7f7");
    }

    function mapLeave(d){
        var stateAbv;
        abv.forEach(function (e) {
            if (e.state == d.key) {
                return stateAbv = e.abv
            }
        });
        d3.selectAll(".statesBack").style("fill","none");

    }

    function mapClick (d,i){

        var stateAbv;
        abv.forEach(function (e) {
            if (e.state == d.key) {
                return stateAbv = e.abv
            }
        });
        d3.selectAll(".statesBack").classed("active",false);
        d3.select(".statesBack"+stateAbv).classed("active",true);

        $("html, body").animate({
            scrollTop: ($("#perState").offset().top)
        }, 500);

        d3.select("#perState").style("overflow","inherit");
        d3.select("#perState").classed("container-height",true);

        d3.select(".spiderTransp").remove();
        d3.select(".axisWrapperTransp").remove();

        d3.select(".spiderCorr").remove();
        d3.select(".axisWrapperCorr").remove();

        d3.select(".spiderDiscl").remove();
        d3.select(".axisWrapperDiscl").remove();

        var id;

        if (d.length==4){
             id = d[0].group;
        }else{
             id = d.key;
        }

        //filter TRANSPARENCY by state selected
        var entries = crossfilter (transpData);
        var entriesByState = entries.dimension(function(d){return d.group});
        var stateTransp = entriesByState.filter(id).top(Infinity);

        //filter TRANSPARENCY by state selected
        var entriesCorruption = crossfilter (corrData);
        var entriesCorruptionByState = entriesCorruption.dimension(function(d){return d.group});
        var stateCorruption = entriesCorruptionByState.filter(id).top(Infinity);

        var disclosure,corruption,transparency,form;

        nestedDataDiscl.forEach(function(e){
                if (e.key==id){
                    return disclosure = e;
                }
            }
        );

        d3.select("#State").html(id);

        //disclosure
        disclScore.forEach(function(e){
                if (e.state == id){
                    d3.select("#indexDisclNumber").html(e.score);
                }}
        );

        //transparency
        transpScore.forEach(function(e){
                if (e.state == id){
                    d3.select("#indexTranspNumber").html(e.score).style("color",scaleColorTransp(e.score));
                    return transparency=e.score;
                }}

        );

        var nestedStateTransp = d3.nest()
            .key(function(d){
                return d.group
            })
            .sortValues(function(a,b){return a.id - b.id})
            .entries(stateTransp);

        //corruption
        corrScore.forEach(function(e){
                if (e.state == id){
                    d3.select("#indexCorrupNumber").html(e.score).style("color",scaleColorTransp(e.score));
                    return corruption= e.score;
                }}
        );

        forms.forEach(function (e){
                if (e.state == id){
                    d3.select("#governorName").html(e.governor);
                    d3.select("#governorYear").html(" ("+e.year+")");
                    if (e.notes=="no form"){
                        d3.select("#pdf").html("&nbsp;<b>"+e.governor+"</b>’s disclosure form not available").attr("href","#").style("pointer-events","none");
                    }else{
                        d3.select("#pdf").html("&nbsp; Download <b>"+e.governor+"</b>’s disclosure form").attr("href", ("Governor-Financial-Disclosures/"+e.name)).attr("target","_blank").style("pointer-events","initial")
                    }

                }}
        );

        allRankings.forEach(function (e){
                if (e.state == id){
                    d3.select("#disclRank").html(e.disclosure);
                    d3.select("#transpRank").html(e.transparency);
                    d3.select("#corrupRank").html(e.corruption);
                }}
        );

        //for the states description
        //descriptionState.forEach(function (e){
        //        if (e.state == id){
        //            d3.select("#infoText").html(e.description)
        //        }}
        //);

        var nestedStateCorruption = d3.nest()
            .key(function(d){
                return d.group
            })
            .sortValues(function(a,b){return a.id - b.id})
            .entries(stateCorruption);

        var cfg2 = {
            radius: (chartWStateTransp-150)/2,
            levels: 5,
            opacityCircles: 1,
            labelFactor: 1.3, 			//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 100, 			//The number of pixels after which a label needs to be given a new line
            color: "rgba(255,255,255,1)",
            roundStrokes: true,
            dotRadius: 3,
            dotRadiusBigger: 6,
        };

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////


        var axisDisclVar = ((disclosure.values).map(function(i, j){return i.axis})),//Names of each axis,
            totalDiscl = axisDisclVar.length,					//The number of different axes
            angleSliceDiscl = Math.PI * 2 / totalDiscl,			//The width in radians of each "slice"
            axisTranspVar = ((nestedStateTransp[0].values).map(function(i, j){return i.axis})),	//Names of each axis
            totalTransp = axisTranspVar.length,					//The number of different axes
            radius = cfg2.radius, 			//Radius of the outermost circle
            angleSliceTransp = Math.PI * 2 / totalTransp,			//The width in radians of each "slice"
            maxValue = 1;

        //Scale for the radius
        var rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);

        //Wrapper for the grid & axes
        var axisGridTransp = plotTransp.append("g").attr("class", "axisWrapperTransp").attr('transform','translate('+ (chartWStateTransp/2)+','+ (chartHStateTransp/2)+')');
        var spiderPlotTransp = plotTransp.append("g").attr("class", "spiderTransp").attr('transform','translate('+ (chartWStateTransp/2)+','+ (chartHStateTransp/2)+')');
        var axisGridCorr = plotCorr.append("g").attr("class", "axisWrapperCorr").attr('transform','translate('+ (chartWStateCorr/2)+','+ (chartHStateCorr/2)+')');
        var spiderPlotCorr = plotCorr.append("g").attr("class", "spiderCorr").attr('transform','translate('+ (chartWStateCorr/2)+','+ (chartHStateCorr/2)+')');
        var axisGridDiscl = plotDiscl.append("g").attr("class", "axisWrapperDiscl").attr('transform','translate('+ (chartWStateDiscl/2)+','+ (chartHStateDiscl/2)+')');
        var spiderPlotDiscl = plotDiscl.append("g").attr("class", "spiderDiscl").attr('transform','translate('+ (chartWStateDiscl/2)+','+ (chartHStateDiscl/2)+')');

        //Draw the background circles
        axisGridDiscl.selectAll(".levels")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return cfg2.radius/cfg2.levels*d;})
            .style("fill", "none")
            .style("stroke", cfg2.colorLines)
            .style("fill-opacity", cfg2.opacityCircles);

        //Text indicating at what % each level is
        axisGridDiscl.selectAll(".axisLabelStroke")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabelStroke")
            .attr("x", 4)
            .attr("y", function(d){return -d*cfg2.radius/cfg2.levels;})
            .attr("dy", "0.4em")
            .text(function(d,i) { return (d/cfg2.levels)});

        axisGridDiscl.selectAll(".axisLabel")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function(d){return -d*cfg2.radius/cfg2.levels;})
            .attr("dy", "0.4em")
            .text(function(d,i) { return (d/cfg2.levels)});

        //Create the straight lines radiating outward from the center
        var axisDiscl = axisGridDiscl.selectAll(".axis")
            .data(axisDisclVar)
            .enter()
            .append("g")
            .attr("class", "axis");


        //Append the lines
        axisDiscl.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ return rScale(maxValue) * Math.cos(angleSliceDiscl*i); })
            .attr("y2", function(d, i){ return rScale(maxValue) * Math.sin(angleSliceDiscl*i); })
            .attr("class", "spiderLine")
            .attr("transform","rotate(-18)");

        //Append the labels at each axis
        axisDiscl.append("text")
            .attr("class", "legend")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ return rScale(maxValue * cfg2.labelFactor) * Math.cos(angleSliceDiscl*i - Math.PI/2); })
            .attr("y", function(d, i){ return rScale(maxValue * cfg2.labelFactor) * Math.sin(angleSliceDiscl*i - Math.PI/2); })
            .text(function(d){return d})
            .call(wrap, cfg2.wrapWidth);


        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        var radarLineDiscl = d3.radialLine()
            .radius(function(d) {
                return rScale(d.value); })
            .angle(function(d,i) {	return i*angleSliceDiscl; });

        ////Append the backgrounds
        //spiderPlotDiscl
        //    .append("path")
        //    .datum(disclosure.values)
        //    .attr("class", "radarAreaDiscl")
        //    .attr("d", radarLineDiscl)
        //    .style("opacity",0)
        //    .transition()
        //    .delay(1500)
        //    .duration(500)
        //    .style("opacity",1);

        //Create the outlines
        spiderPlotDiscl
            .append("path")
            .datum(disclosure.values)
            .attr("class", "radarLineDiscl")
            .attr("d", radarLineDiscl)
            .style("opacity",0)
            .transition()
            .delay(1500)
            .duration(500)
            .style("opacity",1);

        spiderPlotDiscl.select(".radarLineDiscl").attr("d", spiderPlotDiscl.select(".radarLineDiscl").attr("d") + " Z");

        //Append the circles
        spiderPlotDiscl.selectAll(".radarCircle")
            .data(disclosure.values)
            .enter().append("circle")
            .attr("class", function(d,i){
                return "radarCircle radarDisclCircle " + "radarDisclCircle"+ i})
            .attr("r", 0)
            .attr("cx",0)
            .attr("cy", 0)
            .transition()
            .duration(1500)
            .attr("r",function(d,i){
                return cfg2.dotRadius
            })
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSliceDiscl*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSliceDiscl*i - Math.PI/2); });

        //transparent circles for tooltip
        spiderPlotDiscl
            .selectAll(".radarTooltip")
            .data(disclosure.values)
            .enter().append("circle")
            .attr("class","radarTooltip")
            .style("opacity",0)
            .attr("r", 0)
            .attr("cx",0)
            .attr("cy", 0)
            .on("mouseover",function(d,i){
                d3.select(".radarDisclCircle"+ i).attr("r",7);
                var tooltip = d3.select(".custom-tooltipDiscl");
                tooltip.select("#indexDiscl").html(d.value);

                disclDesc.forEach(function(e){
                    if (d.axis== e.variable){
                        tooltip.select("#descriptionDiscl").html(e.description);
                    }
                });

                var xy = d3.mouse(document.getElementById("radarChartDiscl"));
                var left = xy[0],
                    top = xy[1];

                d3.select(".custom-tooltipDiscl")
                    .style("left", (left)+ "px")
                    .style("top", top+ "px")
                    .style("display","inherit");
            })
            .on("mouseleave",function(d){
                d3.selectAll(".radarDisclCircle").attr("r", cfg2.dotRadius);
                d3.select(".custom-tooltipDiscl")
                    .style("display","none");
            })
            .transition()
            .duration(1500)
            .attr("r",10)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSliceDiscl*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSliceDiscl*i - Math.PI/2); });


        ////TRANSPARENCY

        //Draw the background circles
        axisGridTransp.selectAll(".levels")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return cfg2.radius/cfg2.levels*d;})
            .style("fill", "none")
            .style("stroke", cfg2.colorLines)
            .style("fill-opacity", cfg2.opacityCircles);

        //Text indicating at what % each level is
        axisGridTransp.selectAll(".axisLabelStroke")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabelStroke")
            .attr("x", 4)
            .attr("y", function(d){return -d*cfg2.radius/cfg2.levels;})
            .attr("dy", "0.4em")
            .text(function(d,i) { return (d/cfg2.levels)});

        axisGridTransp.selectAll(".axisLabel")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function(d){return -d*cfg2.radius/cfg2.levels;})
            .attr("dy", "0.4em")
            .text(function(d,i) { return (d/cfg2.levels)});

        //Create the straight lines radiating outward from the center
        var axisTransp = axisGridTransp.selectAll(".axis")
            .data(axisTranspVar)
            .enter()
            .append("g")
            .attr("class", "axis");


        //Append the lines
        axisTransp.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ return rScale(maxValue) * Math.cos(angleSliceTransp*i); })
            .attr("y2", function(d, i){ return rScale(maxValue) * Math.sin(angleSliceTransp*i); })
            .attr("class", "spiderLine")
            .attr("transform","rotate(13)");

        //Append the labels at each axis
        axisTransp.append("text")
            .attr("class", "legend")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ return rScale(maxValue * cfg2.labelFactor) * Math.cos(angleSliceTransp*i - Math.PI/2); })
            .attr("y", function(d, i){ return rScale(maxValue * cfg2.labelFactor) * Math.sin(angleSliceTransp*i - Math.PI/2); })
            .text(function(d){return d})
            .call(wrap, cfg2.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        var radarLine = d3.radialLine()
            .radius(function(d) {
                return rScale(d.value); })
            .angle(function(d,i) {	return i*angleSliceTransp; });

        ////Append the backgrounds
        //spiderPlotTransp
        //    .append("path")
        //    .datum(nestedStateTransp[0].values)
        //    .attr("class", "radarAreaTransp")
        //    .attr("d", radarLine)
        //    .style("opacity",0)
        //    .style("fill",scaleColorTransp(transparency))
        //    .transition()
        //    .delay(1500)
        //    .duration(500)
        //    .style("opacity",0.1);

        //Create the outlines
        spiderPlotTransp
            .append("path")
            .datum(nestedStateTransp[0].values)
            .attr("class", "radarLineTransp")
            .attr("d", radarLine)
            .style("opacity",0)
            .style("stroke",scaleColorTransp(transparency))
            .transition()
            .delay(1500)
            .duration(500)
            .style("opacity",1);

        spiderPlotTransp.select(".radarLineTransp").attr("d", spiderPlotTransp.select(".radarLineTransp").attr("d") + " Z");

        //Append the circles
        spiderPlotTransp.selectAll(".radarCircleTransp")
            .data(nestedStateTransp[0].values)
            .enter().append("circle")
            .attr("class", function(d,i){
                return "radarCircleTransp " + "radarCircleTransp"+ i})
            .attr("r", 0)
            .attr("cx",0)
            .attr("cy", 0)
            .style("fill",scaleColorTransp(transparency))
            .transition()
            .duration(1500)
            .attr("r",function(d,i){
                if (d.axis =="Personal financial disclosure") {return cfg2.dotRadiusBigger }
                else{return cfg2.dotRadius}
            })
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSliceTransp*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSliceTransp*i - Math.PI/2); });

        spiderPlotTransp
            .selectAll(".radarTooltipTransp")
            .data(nestedStateTransp[0].values)
            .enter().append("circle")
            .attr("class","radarTooltipTransp")
            .style("opacity",0)
            .attr("r", 0)
            .attr("cx",0)
            .attr("cy", 0)
            .on("mouseover",function(d,i){
                d3.select(".radarCircleTransp"+ i).attr("r",7);

                var tooltip = d3.select(".custom-tooltipTransp");
                tooltip.select("#indexTransp").html(d.value);

                transpDesc.forEach(function(e){
                    if (d.axis== e.variable){
                        tooltip.select("#descriptionTransp").html(e.description);
                    }
                });

                var xy = d3.mouse(document.getElementById("radarChartTransp"));
                var left = xy[0],
                    top = xy[1];

                d3.select(".custom-tooltipTransp")
                    .style("left", (left)+ "px")
                    .style("top", top+ "px")
                    .style("display","inherit");
            })
            .on("mouseleave",function(d){
                d3.selectAll(".radarCircleTransp").attr("r", cfg2.dotRadius);
                d3.select(".radarCircleTransp0").attr("r",cfg2.dotRadiusBigger);
                d3.select(".custom-tooltipTransp")
                    .style("display","none");
            })
            .transition()
            .duration(1500)
            .attr("r",10)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSliceTransp*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSliceTransp*i - Math.PI/2); });

        //Draw the background circles
        axisGridCorr.selectAll(".levels")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return cfg2.radius/cfg2.levels*d;})
            .style("fill", "none")
            .style("stroke", cfg2.colorLines)
            .style("fill-opacity", cfg2.opacityCircles);

        //Text indicating at what % each level is
        axisGridCorr.selectAll(".axisLabelStroke")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabelStroke")
            .attr("x", 4)
            .attr("y", function(d){return -d*cfg2.radius/cfg2.levels;})
            .attr("dy", "0.4em")
            .text(function(d,i) { return (d/cfg2.levels)});

        axisGridCorr.selectAll(".axisLabel")
            .data(d3.range(1,(cfg2.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function(d){return -d*cfg2.radius/cfg2.levels;})
            .attr("dy", "0.4em")
            .text(function(d,i) { return (d/cfg2.levels)});

/////////////////////////////////////////////////////////
//////////////////// Draw the axes //////////////////////
/////////////////////////////////////////////////////////

        //Todo Corruption
        var allAxisCorr = ((nestedStateCorruption[0].values).map(function(i, j){return i.axis})),	//Names of each axisCorr
            totalCorr = allAxisCorr.length,					//The number of different axes
            angleSliceCorr = Math.PI * 2 / totalCorr;			//The width in radians of each "slice"


        //Create the straight lines radiating outward from the center
        var axisCorr = axisGridCorr.selectAll(".axisCorr")
            .data(allAxisCorr)
            .enter()
            .append("g")
            .attr("class", "axisCorr");


        //Append the lines
        axisCorr.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ return rScale(maxValue) * Math.cos(angleSliceCorr*i); })
            .attr("y2", function(d, i){ return rScale(maxValue) * Math.sin(angleSliceCorr*i); })
            .attr("class", "spiderLine")
        //.attr("transform","rotate(13)");

        //Append the labels at each axisCorr
        axisCorr.append("text")
            .attr("class", "legend")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ return rScale(maxValue * cfg2.labelFactor) * Math.cos(angleSliceCorr*i - Math.PI/2); })
            .attr("y", function(d, i){ return rScale(maxValue * cfg2.labelFactor) * Math.sin(angleSliceCorr*i - Math.PI/2); })
            .text(function(d){return d})
            .call(wrap, cfg2.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        var radarLineCorr = d3.radialLine()
            .radius(function(d) {
                return rScale(d.value); })
            .angle(function(d,i) {	return i*angleSliceCorr; });

        ////Append the backgrounds
        //spiderPlotCorr
        //    .append("path")
        //    .datum(nestedStateCorruption[0].values)
        //    .attr("class", "radarAreaCorr")
        //    //.duration(500)
        //    .attr("d", radarLineCorr)
        //    .style("fill",scaleColorTransp(corruption))
        //    .style("opacity",0)
        //    .transition()
        //    .delay(1500)
        //    .duration(500)
        //    .style("opacity",0.1);

        //Create the outlines
        spiderPlotCorr
            .append("path")
            .datum(nestedStateCorruption[0].values)
            .attr("class", "radarLineCorr")
            .attr("d", radarLineCorr)
            .style("opacity",0)
            .style("stroke",scaleColorTransp(corruption))
            .transition()
            .delay(1500)
            .duration(500)
            .style("opacity",1);

        spiderPlotCorr.select(".radarLineCorr").attr("d", spiderPlotCorr.select(".radarLineCorr").attr("d") + " Z");

        //Append the circles
        spiderPlotCorr.selectAll(".radarCircleCorr")
            .data(nestedStateCorruption[0].values)
            .enter().append("circle")
            .attr("class", function(d,i){
                return "radarCircleCorr " + "radarCircleCorr"+ i})
            .attr("r", 0)
            .attr("cx",0)
            .attr("cy", 0)
            .style("fill",scaleColorTransp(corruption))
            .transition()
            .duration(1500)
            .attr("r",cfg2.dotRadius)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSliceCorr*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSliceCorr*i - Math.PI/2); });

        //Append the circles
        spiderPlotCorr.selectAll(".radarCircleCorrTooltip")
            .data(nestedStateCorruption[0].values)
            .enter().append("circle")
            .attr("class", "radarCircleCorrTooltip")
            .attr("r", 0)
            .attr("cx",0)
            .attr("cy", 0)
            .style("opacity",0)
            .on("mouseover",function(d,i){
                d3.select(".radarCircleCorr"+ i).attr("r",7);

                var tooltip = d3.select(".custom-tooltipCorrup");
                tooltip.select("#indexCorrup").html(d.value);

                corrDesc.forEach(function(e){
                    if (d.axis== e.variable){
                        tooltip.select("#descriptionCorrup").html(e.description);
                    }
                });

                var xy = d3.mouse(document.getElementById("radarChartCorrup"));
                var left = xy[0],
                    top = xy[1];

                d3.select(".custom-tooltipCorrup")
                    .style("left", (left)+ "px")
                    .style("top", top+ "px")
                    .style("display","inherit");
            })
            .on("mouseleave",function(d){
                d3.selectAll(".radarCircleCorr").attr("r", cfg2.dotRadius);
                d3.select(".custom-tooltipCorrup")
                    .style("display","none");
            })
            .transition()
            .duration(1500)
            .attr("r",cfg2.dotRadius)
            .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSliceCorr*i - Math.PI/2); })
            .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSliceCorr*i - Math.PI/2); });

        /////////////////////////////////////////////////////////
        /////////////////// Helper Function /////////////////////
        /////////////////////////////////////////////////////////

        //Taken from http://bl.ocks.org/mbostock/7555321
        //Wraps SVG text
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
    }

    d3.select('#up').on('click',function(){
        $("html, body").animate({
            scrollTop: ($("#plot1").offset().top)
        }, 500);
    });


}


// parse data
function parse(d){
    return {
        state: d.STATE,
        index: +d["2015 State Integrity Investigation Ranking - Center for Public Integrity (1=best)"]
    }

}

function parseMap(d){

    return {
        state: d.state,
        abv: d.abbreviation,
        x: +d.x,
        y: +d.y
    }
}

function parseData(d){
    //State,Var,Score
    return {
        group: d.State,
        axis: d.Var,
        value: +d.Score,
        id: +d.Id_Var
    }
}

function parseAbv (d){
    return{
        state: d.State,
        abv: d.Abv
    }
}

function parseScore(d){
    return {
        state: d.State,
        score: +d.Score
    }
}

function parseDescriptions(d){
    return {
        variable: d.Var,
        description: d.Desc
    }
}

function parseForms (d){
    return{
        state: d.State,
        governor: d.Governor,
        year: d.Year,
        notes: d.Notes,
        name: d["File Name (Aneri)"],
        url: d["Link to Blank Form"]
    }
}

function parseAllRankings(d){
    return {
        state: d.State,
        disclosure: d["Disclosure ranking"],
        transparency: d["Transparency ranking"],
        corruption: d["Corruption ranking"]
    }
}


/* ############# PEDROs STUFF ############# */

function mapFirstShown(){

    $("html, body").animate({
            scrollTop: ($("#container").offset().top)
    }, 500);
}

function travelToFooter(){

    $("html, body").animate({
            scrollTop: ($("footer").offset().top)
    }, 500);
}
