var Scatter = new Meteor.Collection('scatter');
if (Meteor.isClient) {
  Template.chart.rendered = function () {

      nv.utils.symbolMap.set('thin-x', function (size) {
          size = Math.sqrt(size);
          return 'M' + (-size/2) + ',' + (-size/2) +
        'l' + size + ',' + size +
        'm0,' + -(size) +
        'l' + (-size) + ',' + size;
      });


      var chart;
      nv.addGraph(function () {
          chart = nv.models.scatterChart()
          .showDistX(true)
          .showDistY(true)
          .useVoronoi(true)
          .color(d3.scale.category10().range())
          .duration(300);

          chart.dispatch.on('renderEnd', function() {
            console.log('render complete');
          });

          chart.xAxis.tickFormat(d3.format('.02f'));
          chart.yAxis.tickFormat(d3.format('.02f'));

          d3.select('#scatter svg')
          .datum(randomData(4, 40))
          .call(chart);

          nv.utils.windowResize(chart.update);
          chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });
          return chart;
      });
      function randomData(groups, points) { //# groups,# points per group
          // smiley and thin-x are our custom symbols!
          var data = [],
              shapes = ['thin-x', 'circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
              random = d3.random.normal();
          for (i = 0; i < groups; i++) {
              data.push({
                  key: 'Group ' + i,
                  values: []
              });
              for (j = 0; j < points; j++) {
                  data[i].values.push({
                      x: random(),
                      y: random(),
                      size: Math.round(Math.random() * 100) / 100,
                      shape: shapes[j % shapes.length]
                  });
              }
          }
          return data;
      }
};
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
});
}
