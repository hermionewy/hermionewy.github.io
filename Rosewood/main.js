var m = {t:5,r:5,b:5,l:5},
    w = document.getElementById('plot1').clientWidth - m.l - m.r,
    h = document.getElementById('plot1').clientHeight - m.t - m.b;

var globalDispatch = d3.dispatch('select');
var th = 1.8;
var centralAmerica =['Nicaragua','Panama','Mexico','Belize','Guatemala'],
westAfrica=['Nigeria','Ghana','Gambia','Benin','Guinea Bissau'];

d3.queue()
  .defer(d3.json,'data/countries.geo.json')
  .defer(d3.csv,'data/RosewoodSupplier.csv',parseScore)
	.await(dataLoaded);

function dataLoaded(err,worldMap, suppliers){
  console.log(suppliers);
  var areas = d3.nest()
      .key(function(d){ return d.area}).sortKeys(d3.ascending)
      .rollup(function(leaves){
        var countries =[];
        leaves.forEach(function(d){
          countries.push(d.country);
        })
        return {
        'countries': countries }
      })
      .entries(suppliers);

      $('#plot1').affix({
        offset: {
          top: $('#plot1').offset().top
        }
      });
    var rollingEarth = RollingEarth().w(w).h(h).mapData(worldMap);
    d3.select('#plot1').call(rollingEarth);


    var controller = new ScrollMagic.Controller();

    var scene = new ScrollMagic.Scene({ triggerElement:'#description', offset: -(document.documentElement.clientHeight/th), triggerHook: 0 }) // All races
        .on('start',function(){
          globalDispatch.call('select', this, ['China']);
      		d3.select('.intro').selectAll('p').transition().style('opacity',1);
    });
    var sceneA = new ScrollMagic.Scene({ triggerElement:'#trigger2', offset: -(document.documentElement.clientHeight/th), triggerHook: 0 }) // All races
        .on('start',function(){
          globalDispatch.call('select', this, ['China','Vietnam']);
      		d3.select('.intro').selectAll('p').transition().style('opacity',1);
    });

    var sceneB = new ScrollMagic.Scene({ triggerElement:'#trigger3', offset: -(document.documentElement.clientHeight/th), triggerHook: 0, reverse: true}) // All races - charter schools
				.on('start',function(){
          globalDispatch.call('select', this, ['Laos','Myanmar','Vietnam','Indonesia','Cambodia','Thailand']);
      		d3.select('.intro').selectAll('p').transition().style('opacity',1);
		});

    var sceneC = new ScrollMagic.Scene({ triggerElement:'#trigger4', offset: -(document.documentElement.clientHeight/th), triggerHook: 0, reverse: true}) // All races - charter schools
				.on('start',function(){
          globalDispatch.call('select', this, centralAmerica);
      		d3.select('.intro').selectAll('p').transition().style('opacity',1);
		});
    var sceneD = new ScrollMagic.Scene({ triggerElement:'#trigger5', offset: -(document.documentElement.clientHeight/th), triggerHook: 0, reverse: true}) // All races - charter schools
        .on('start',function(){
          globalDispatch.call('select', this, westAfrica);
      		d3.select('.intro').selectAll('p').transition().style('opacity',1);
    });
    controller.addScene([scene, sceneA, sceneB, sceneC, sceneD]);
    //select
    //var countryList = selection.append("select").attr("name", "countries");
    // sCountries.forEach(function(d) {
    //   option = countryList.append("option");
    //   option.text(d.key);
    //   option.property("value", d.key);
    // });
    //   d3.select('.expl')
    //     .html("<span class='expl_cnt'>" +  getInfo(sCountries, option)[0] + "</span>"+ " city/cities in " + "<span class='expl_number'>"
    //     + option + "</span>"+ " is/are selected as one of the 177 best international cities providing citizens with quality life. <br/><hr/>Selected City: "+
    //     getInfo(sCountries, option)[1]);
    // });
}

//County,RankVolume,Volume,RankValue,Value,ExportBan,Class,Info,Area
function parseScore(d){
  return {
    country: d['Country'],
    rankvolum: d['RankVolume'],
    volum: d['Volume'],
    rankValue: d['RankValue'],
    value: d['Value'],
    ban: d['ExportBan'],
    type: d['Class'],
    info: d['Info']? d['Info']: 'No specific description yet. If you have any information, please contact us. ',
    area: d['Area']
  }
}
