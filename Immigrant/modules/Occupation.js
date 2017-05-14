function Occupation(){
  console.log('Occupation');
  var _year = 2015;

  var exports = function(selection){
    var data = selection.datum()?selection.datum():[];
    var txt =['family', 'employment', 'relative','diversity','refugee','other'];
    var txt2 = ['Family Sponsored', 'Employment Based', 'Immediate relatives of U.S. citizens','Diversity','Refugees and asylees','Other'];
    var dataNewAll = attrData(data);
    var dataNew = dataNewAll.filter(function(d){ return d.year==_year});
    // console.log(dataNew);
    console.log(w,h);
    var scaleX = d3.scaleBand()
	        .domain(txt2)
	        .range([50,w-100]);

    var axisX = d3.axisTop()
        .scale(scaleX)
        .tickSize(h);

    var scaleY = d3.scaleBand()
	        .domain(allOcc)
	        .range([50,h-50]);

    var axisY = d3.axisLeft()
        .scale(scaleY)
        .tickSize(-w);

    var reasonAxis = selection.selectAll('.reasonAxis').data([1]);
    reasonAxis.enter().append('g')
	        .attr('class','reasonAxis')
	        .attr('transform','translate(50,'+h+')')
	        .style('stroke-dasharray', ('6, 3'))
	        .call(axisX)
          .selectAll(".tick text")
          .call(wrap, scaleX.bandwidth())
          .selectAll(".tick line")
          .attr('stroke','#eee');

    var ocpAxis = selection.selectAll('.ocpAxis').data([1]);
    ocpAxis.enter().append('g')
	        .attr('class','ocpAxis')
	        .attr('transform','translate(60,0)')
          .style('stroke-dasharray', ('6, 3'))
	        .call(axisY)
          .selectAll(".tick text")
          .call(wrap, scaleY.bandwidth());

    var ocpNodes = DrawNodes().x(function(d){ return scaleX(d.attr)}).y( function(d){ return scaleY(d.ocp)} ).trans([120,50]);
    plot.datum(dataNew).call(ocpNodes); //{ocp,num}

    function attrData(data){
      var parseData = [];
      function newNum(d, j){
        //console.log(txt[j]);
        if(d[txt[j]] <Np){
          parseData.push({
            year: d.year,
            ocp: d.ocp,
            num: d[txt[j]],
            attr: txt2[j]
          });
        } else if (d[txt[j]]>Np) {
          for(var i=1; i<d[txt[j]]/Np; i++){
            parseData.push({
              year: d.year,
              ocp: d.ocp,
              num: Np,
              attr: txt2[j]
            });
          }
            parseData.push({
              year: d.year,
              ocp: d.ocp,
              num: d[txt[j]]%Np,
              attr: txt2[j]
            })
        }
        return parseData;
      }
      data.forEach(function(datum){
        for( var i=0; i<6; i++){
          newNum(datum, i);
        }
        return newNum(datum);
      });
      return ([].concat.apply([], parseData));
    }

    function wrap(text, width) {
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.1, // ems
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
      }


  }
  exports.chooseYear= function(_){
    if(!arguments.length) return 2015;
    _year =_;
    return this;
  }
  return exports;
}
