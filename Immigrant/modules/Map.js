function Map(){
  console.log('Map');
  var _scale=160;
  function exports(selection){
    path = d3.geoPath().projection(projection);
        console.log(w,h);
    var _mapData = selection.datum()? selection.datum():[];
    projection.fitExtent([[m.l,m.t],[w2,h2]],_mapData).scale(_scale);
    dataMapping = d3.map(_mapData.features,function(d){return d.properties.name || d.properties['NAME']});

    var mapBase = selection.selectAll('.mapData')
        .data([1]);
    var mapEnter = mapBase
        .enter()
        .append('g')
        .attr('class','mapData')
        .attr('transform','translate(0,0)')
    var countries = mapEnter.merge(mapBase)
        .selectAll('.countries')
        .data(_mapData.features)

    var countriesEnter = countries
        .enter()
        .append('path')
        .attr('class','countries')
        .transition();

    mapEnter.merge(mapBase)
        .selectAll('.countries')
        .attr('d',path)
        .style('fill','#E6E6E9')
        .style('stroke-width','1px')
        .style('stroke','#969696');

        countries.exit().remove();
  }
  exports.projection = function(_){
//    if(!arguments.length) return 0;
            	projection = _;
            	return this;               //this means exports function;
        }

  exports.scaleP = function(_){
    if(!arguments.length) return 0;
            	_scale = _;
            	return this;               //this means exports function;
        }

  return exports;
}
