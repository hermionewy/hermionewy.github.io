function tableDraw(){
  var M = {t:10,r:10,b:10,l:10}, W, H;
  function exports(selection){

    W = W || selection.node().clientWidth - M.l - M.r;
    H = H || selection.node().clientHeight - M.t - M.b;
    var arr = selection.datum()?selection.datum():[];

    var tbSelect = selection.selectAll('table').data([1]);
    var tbEnter = tbSelect.enter().append('table');

    tbEnter.append('thead').append('tr')
    .selectAll('th')
    .data(attrB).enter()
    .append('th')
    .attr('class', 'thAttr')
    .text(function(d){ return d});

    tbEnter.append('tbody').append('tr');

//
 var alltd = tbSelect.merge(tbEnter).select('tbody')
    .selectAll('.tdAttr')
    .data(arr);

 var alltdEnter = alltd
    .enter()
    .append('td')
    .attr('class','tdAttr');

    selection.selectAll('.tdAttr')
    .text(function(d){ return d.value });

  }

  return exports;
}
