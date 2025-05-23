function Circles(){

  var _circleStyle ={
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.1,
      radius: 5
  };

  var exports = function(selection){
    var map = Map();
    console.log('DrawCircles');
    var arr = selection.datum()?selection.datum():[];
    var circles = Array.from(arr,function(d){
      d.circle = L.circle(JSON.parse(d.location),_circleStyle)
             .bindPopup("Description: " + d.description.toLowerCase() + "<br />Time: "+d.time );
             return d.circle;
    });
    var cirlesLayer = L.layerGroup(circles).addLayer().addTo(map);

    }


  exports.style = function(_){
    if(!arguments.length) return _circleStyle;
    _circleStyle = _;
    return this;
  }
  return exports;
}
