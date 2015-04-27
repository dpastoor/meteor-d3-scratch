Scatter = new Meteor.Collection("Scatter");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (Meteor.isClient) {
  Template.chart.rendered = function() {
    var chart = nv.models.lineChart()
      .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
      .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
      .showYAxis(true)        //Show the y-axis
      .showXAxis(true)        //Show the x-axis
    ;

    nv.addGraph(function() {
      chart.xAxis.axisLabel('Time').tickFormat(d3.format('d'));
      chart.yAxis.axisLabel('Conc (ng/mL)').tickFormat(d3.format('d'));
      d3.select('#chart svg').datum(
        [{ values: Scatter.find().fetch()}]
      ).call(chart);
      nv.utils.windowResize(function() { chart.update(); });
      return chart;
    });

    this.autorun(function () {
      d3.select('#chart svg').datum(
        [{ values: Scatter.find().fetch(), key: 'ID' }]
      ).call(chart);
      chart.update();
    });
  };

  Template.chart.events({
    'click #addDataButton': function() {
      var point = getRandomInt(13, 89);
      var lastPoint = Scatter.findOne({}, {fields:{x:1},sort:{x:-1},limit:1,reactive:false});
      if (lastPoint) {
        Scatter.insert({x:(lastPoint.x + 1), y:point});
      } else {
        Scatter.insert({x:1, y:point});
      }
    },
    'click #removeDataButton': function() {
      var lastPoint = Scatter.findOne({}, {fields:{x:1},sort:{x:-1},limit:1,reactive:false});
      if (lastPoint) {
        Scatter.remove(lastPoint._id);
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
