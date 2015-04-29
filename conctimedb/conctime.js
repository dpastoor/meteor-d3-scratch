  Data = new Meteor.Collection("Data");

if (Meteor.isClient) {
  Template.chart.rendered = function() {

_initialize();

function _initialize() {

  Data.find().observe({
    changed:function(bar) {
      console.log("changed!");
      console.log("removing old chart");

      loadChart();
    }
  });
}

    console.log("rendering chart!");
    console.log(Data.findOne().data);
    nv.addGraph(loadChart);

    function loadChart() {
    var chart = nv.models.lineChart();
    var fitScreen = false;
    var width = 600;
    var height = 300;
    var zoom = 1;
    // currently a bug where if new data is added and refreshed get
    //property data undefined and by just adding a space etc here resaving so meteor
    // updates the chart will re-render properly
      console.log("inside loadChart");
      console.log(Data.findOne().data);
      var data = Data.findOne().data;



      chart.useInteractiveGuideline(true);
      chart.xAxis
          .axisLabel('Time (hours)')
          .tickFormat(d3.format(',r'));
      chart.lines.dispatch.on("elementClick", function(evt) {
          console.log(evt);
      });
      chart.yAxis
          .axisLabel('Concentration (ng/mL)')
          .tickFormat(d3.format(',.2f'));
      d3.select('#chart svg')
          .attr('perserveAspectRatio', 'xMinYMid')
          .attr('width', width)
          .attr('height', height)
          .data([data]);
      setChartViewBox();
      resizeChart();
      nv.utils.windowResize(resizeChart);
      d3.select('#zoomIn').on('click', zoomIn);
      d3.select('#zoomOut').on('click', zoomOut);
      function setChartViewBox() {
          var w = width * zoom,
              h = height * zoom;
          chart
              .width(w)
              .height(h);
          d3.select('#chart svg')
              .attr('viewBox', '0 0 ' + w + ' ' + h)
              .transition().duration(500)
              .call(chart);
      }
      function zoomOut() {
          zoom += .25;
          setChartViewBox();
      }
      function zoomIn() {
          if (zoom <= .5) return;
          zoom -= .25;
          setChartViewBox();
      }
      // This resize simply sets the SVG's dimensions, without a need to recall the chart code
      // Resizing because of the viewbox and perserveAspectRatio settings
      // This scales the interior of the chart unlike the above
      function resizeChart() {
          var container = d3.select('#chart1');
          var svg = container.select('svg');
          if (fitScreen) {
              // resize based on container's width AND HEIGHT
              var windowSize = nv.utils.windowSize();
              svg.attr("width", windowSize.width);
              svg.attr("height", windowSize.height);
          } else {
              // resize based on container's width
              var aspect = chart.width() / chart.height();
              var targetWidth = parseInt(container.style('width'));
              svg.attr("width", targetWidth);
              svg.attr("height", Math.round(targetWidth / aspect));
          }
      }
      return chart;
    }

};


}
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (Data.find().count() ===0) {
      Data.insert({data: [
          {
              values: [{x:0,y:0},{x:0.25,y:8.61},{x:0.5,y:19.44},{x:1,y:34.01},{x:2,y:30.23},{x:3,y:31.3},
              {x:4,y:24.98},{x:6,y:23.38},{x:8,y:23.51},{x:12,y:14.68},{x:16,y:9.07},{x:24,y:5.3}] ,
              key: "1",
              color: "#ff7f0e"
          },
          {
              values:[{"x":0,"y":0},{"x":0.25,"y":30.4},{"x":0.5,"y":47.63},{"x":1,"y":64.43},{"x":2,"y":100.18},{"x":3,"y":92.56},{"x":4,"y":65.27},
              {"x":6,"y":49.26},{"x":8,"y":60.29},{"x":12,"y":44.25},{"x":16,"y":41.85},{"x":24,"y":32.9}] ,
              key: "2",
              color: "#2ca02c"
          },
          {
              values:[{"x":0,"y":0},{"x":0.25,"y":31.4},{"x":0.5,"y":42.63},{"x":1,"y":69.43},{"x":2,"y":91.18},{"x":3,"y":84.56},{"x":4,"y":66.27},
              {"x":6,"y":52.26},{"x":8,"y":62.29},{"x":12,"y":41.25},{"x":16,"y":38.85},{"x":24,"y":31.9}] ,
              key: "3",
              color: "#4ecdc4"
          }
        ]

      });
      console.log("new data added!");
      console.log(Data.findOne());
    }
  });
}
