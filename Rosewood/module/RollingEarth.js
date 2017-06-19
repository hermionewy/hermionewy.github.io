function RollingEarth(){
  console.log('RollingEarth');
  var _mapData=[], _selected=[];
  var sens = 0.25,
  focused,
  worldCenter;
  var _width = 100, _height =100;
  function getCenter(worldJson, sct) {
    var center=[];
    worldJson.features.forEach(
      function(d){
        if(d.properties.name == sct){
          center = d.geometry; }
      });
    return center;
  }

  function exports(selection){
    //Setting projection
    var countryTooltip = selection.append("div")
      .attr("class", "countryTooltip");

    var projection = d3.geoOrthographic()
    .scale(220)
    .rotate([0, 0])
    .translate([_width / 2, _height / 2])
    .clipAngle(90);

    var path = d3.geoPath()
    .projection(projection);

    //SVG container
    var svg = selection.append("svg")
    .attr("width", _width)
    .attr("height", _height);

    //Adding water
    svg.append("path")
    .datum({type: "Sphere"})
    .attr("class", "water")
    .attr("d", path);



      //Drawing countries on the globe
      var map = svg.selectAll("path.land")
      .data(_mapData.features)
      .enter().append("path")
      .attr("class", "land")
      .attr("d", path)
      .call(
        d3.drag()
        .subject(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
        .on("drag", function() {
          var rotate = projection.rotate();
          projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
          svg.selectAll("path.land").attr("d", path);
          svg.selectAll(".focused").classed("focused", focused = false);
        })
      );

      map.on("mouseover", function(d) {
          countryTooltip
          .text(d.properties.name)
          .style("left", (d3.event.screenX-80) + "px")
          .style("top", (d3.event.screenY-100) + "px")
          .style("display", "block")
          .style("opacity", 1);
        })
        .on("mousemove", function(d) {
          countryTooltip.style("left", (d3.event.screenX-80) + "px")
          .style("top", (d3.event.screenY-100) + "px");
        })
        .on("mouseout", function(d) {
                  countryTooltip.style("opacity", 0)
                  .style("display", "none");
                });


    globalDispatch.on('select', function (sCountries){
      console.log(sCountries);
      var rotate = projection.rotate();
      var focusedCountry = getCenter(_mapData, sCountries[0]);
      worldCenter = d3.geoCentroid(focusedCountry);
      console.log(focusedCountry);
      svg.selectAll(".focused").classed("focused", focused = false);

      d3.transition()
        .duration(2500)
        .tween("rotate", function() {
           var r = d3.geoInterpolate(projection.rotate(), [-worldCenter[0],-worldCenter[1]]);
                      return function(t) {
                        projection.rotate(r(t));
                        svg.selectAll("path.land").attr("d", path)
                            .classed("focused", function(d) {
                              for(var j=0; j<sCountries.length; j++){
                                if(sCountries[j]==d.properties.name){ return true }
                              }
                              return false;
                            });
                      };
       });

    });
  //     //start
  // globalDispatch.on('select', function (sCountries){
  //   console.log(sCountries); //one country or more
  //   var rotate = projection.rotate();
  //   var focusedCountry = getCenter(_mapData, sCountries[0]);
  //   worldCenter = d3.geoCentroid(focusedCountry);
  //
  //   svg.selectAll(".focused").classed("focused", focused = false);
  //
  //   d3.transition()
  //   .duration(2500)
  //   .tween("rotate", function() {
  //     var r = d3.geoInterpolate(projection.rotate(), [-worldCenter[0],-worldCenter[1]]);
  //     return function(t) {
  //       projection.rotate(r(t));
  //       svg.selectAll("path.land").attr("d", path)
  //       .classed("focused", function(d) {
  //           for (var j=0; j< sCountries.length; j++){
  //             if (sCountries[j] == d.properties.name){
  //               return true;
  //             } else {
  //                 return false;
  //               }
  //           }
  //     });
  //   };
  //   });
  // }
   //end

  } //exports end

    exports.mapData = function(_arr){
      if(!arguments.length) return _mapData;
      _mapData = _arr;
      return this;
    }
    exports.w = function(_){
      if(!arguments.length) return _width;
      _width = _;
      return this;
    }
    exports.h = function(_){
      if(!arguments.length) return _height;
      _height = _;
      return this;
    }
    return exports;
  }
