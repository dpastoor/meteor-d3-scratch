Data = new Meteor.Collection("Data");

if (Meteor.isClient) {
      Template.OuterChart.onCreated(function() {
      this.subscribe("Data");
      });
  Template.Chart.onRendered(function() {
    console.log("onRendered");
            d3.csv("data/idData.csv", function(error, idData) {
          // Various formatters.
          var formatNumber = d3.format(",d"),
              formatChange = d3.format("+,d");
          // A nest operator, for grouping the flight list.

          //originally nestByTime, would think would want to nest by ID but doen't exactly know whats going on so commenting out for now
          //var nestByID= d3.nest()
           //   .key(function(d) { return d3.ID; });
          // A little coercion, since the CSV is untyped.
          idData.forEach(function(d, i) {
            d.index = i;
            //d.key = d.ID; //trying to get key to work with key is not a function error in grouping
            d.ID = +d.ID;
            d.WEIGHT = +d.WEIGHT;
            d.AGE = +d.AGE;
            d.CMAX = +d.CMAX;
            d.AUC = +d.AUC;
          });
          // Create the crossfilter for the relevant dimensions and groups.
          var idDat = crossfilter(idData),
              all = idDat.groupAll(),
              id = idDat.dimension(function(d) {return Math.max(0, d.ID); }),
              ids = id.group(function(d) {return Math.floor(d.ID) }),
              age = idDat.dimension(function(d) { return Math.max(0, d.AGE); }),
              ages = age.group(function(d) { return Math.floor(d / 5) * 5; }),
              weight = idDat.dimension(function(d) { return Math.max(0, d.WEIGHT); }),
              weights = weight.group(function(d) { return Math.floor(d / 5) * 5; }),
              cmax = idDat.dimension(function(d) { return Math.max(0, d.CMAX); }),
              cmaxs = cmax.group(function(d) { return Math.floor(d / 10) * 10; }),
              auc = idDat.dimension(function(d) { return Math.max(0, d.AUC); }),
              aucs = auc.group(function(d) { return Math.floor(d / 50) * 50; });

              console.log("max age:")
              console.log(Math.max.apply(Math, idData.map(function(d) {return d.AGE})));

          var charts = [
            barChart()
                .dimension(cmax)
                .group(cmaxs)
              .x(d3.scale.linear()
                .domain([0, 140])
                .rangeRound([0, 10 * 24])),
            barChart()
                .dimension(weight)
                .group(weights)
              .x(d3.scale.linear()
                .domain([40, 100])
                .rangeRound([0, 10 * 20])),
            barChart()
                .dimension(auc)
                .group(aucs)
              .x(d3.scale.linear()
                .domain([0, 1500])
                .rangeRound([0, 10 * 40])),
            barChart()
                .dimension(age)
                .group(ages)
              .x(d3.scale.linear()
                .domain([35, Math.max.apply(Math, idData.map(function(d) {return d.AGE}))+1])
                .rangeRound([0, 10 * 20]))
              // id doesn't work due to only 1 person per group so will need to use a different strategy
          ];
          // Given our array of charts, which we assume are in the same order as the
          // .chart elements in the DOM, bind the charts to the DOM and render them.
          // We also listen to the chart's brush events to update the display.
          var chart = d3.selectAll(".chart")
              .data(charts)
              .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });
          // Render the initial lists.
//          var list = d3.selectAll(".list")
//              .data([flightList]);
//          // Render the total.
//          d3.selectAll("#total")
//              .text(formatNumber(flight.size()));
          renderAll();
          // Renders the specified chart or list.
          function render(method) {
            d3.select(this).call(method);
          }
          // Whenever the brush moves, re-rendering everything.
          function renderAll() {
            chart.each(render);
            //list.each(render);
            d3.select("#active").text(formatNumber(all.value()));
          }
          window.filter = function(filters) {
            filters.forEach(function(d, i) { charts[i].filter(d); });
            renderAll();
          };
          window.reset = function(i) {
            charts[i].filter(null);
            renderAll();
          };
          // remove list for now
   //       function flightList(div) {
   //         var valuesByID = nestByID.entries(date.top(40));
   //         div.each(function() {
   //           var date = d3.select(this).selectAll(".date")
   //               .data(valuesByID, function(d) { return d.key; });
   //           date.enter().append("div")
   //               .attr("class", "date")
   //             .append("div")
   //               .attr("class", "day")
   //               .text(function(d) { return formatDate(d.values[0].date); });
   //           date.exit().remove();
   //           var flight = date.order().selectAll(".flight")
   //               .data(function(d) { return d.values; }, function(d) { return d.index; });
   //           var flightEnter = flight.enter().append("div")
   //               .attr("class", "flight");
   //           flightEnter.append("div")
   //               .attr("class", "time")
   //               .text(function(d) { return formatTime(d.date); });
   //           flightEnter.append("div")
   //               .attr("class", "origin")
   //               .text(function(d) { return d.origin; });
   //           flightEnter.append("div")
   //               .attr("class", "destination")
   //               .text(function(d) { return d.destination; });
   //           flightEnter.append("div")
   //               .attr("class", "distance")
   //               .text(function(d) { return formatNumber(d.distance) + " mi."; });
   //           flightEnter.append("div")
   //               .attr("class", "delay")
   //               .classed("early", function(d) { return d.delay < 0; })
   //               .text(function(d) { return formatChange(d.delay) + " min."; });
   //           flight.exit().remove();
   //           flight.order();
   //         });
   //       }
          function barChart() {
           if (!barChart.id) barChart.id = 0;
            var margin = {top: 10, right: 10, bottom: 20, left: 10},
                x,
                y = d3.scale.linear().range([100, 0]),
                id = barChart.id++,
                axis = d3.svg.axis().orient("bottom"),
                brush = d3.svg.brush(),
                brushDirty,
                dimension,
                group,
                round;
            function chart(div) {
              var width = x.range()[1],
                  height = y.range()[0];
                  //perhaps for id to work can add a check for y domain and give a min value of 1 if only 1
              y.domain([0, group.top(1)[0].value]);
              div.each(function() {
                var div = d3.select(this),
                    g = div.select("g");
                // Create the skeletal chart.
                if (g.empty()) {
                  div.select(".title").append("a")
                      .attr("href", "javascript:reset(" + id + ")")
                      .attr("class", "reset")
                      .text("reset")
                      .style("display", "none");
                  g = div.append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                  g.append("clipPath")
                      .attr("id", "clip-" + id)
                    .append("rect")
                      .attr("width", width)
                      .attr("height", height);
                  g.selectAll(".bar")
                      .data(["background", "foreground"])
                    .enter().append("path")
                      .attr("class", function(d) { return d + " bar"; })
                      .datum(group.all());
                  g.selectAll(".foreground.bar")
                      .attr("clip-path", "url(#clip-" + id + ")");
                  g.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(0," + height + ")")
                      .call(axis);
                  // Initialize the brush component with pretty resize handles.
                  var gBrush = g.append("g").attr("class", "brush").call(brush);
                  gBrush.selectAll("rect").attr("height", height);
                  gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                }
                // Only redraw the brush if set externally.
                if (brushDirty) {
                  brushDirty = false;
                  g.selectAll(".brush").call(brush);
                  div.select(".title a").style("display", brush.empty() ? "none" : null);
                  if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", 0)
                        .attr("width", width);
                  } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", x(extent[0]))
                        .attr("width", x(extent[1]) - x(extent[0]));
                  }
                }
                g.selectAll(".bar").attr("d", barPath);
              });
              function barPath(groups) {
                var path = [],
                    i = -1,
                    n = groups.length,
                    d;
                while (++i < n) {
                  d = groups[i];
                  path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                }
                return path.join("");
              }
              function resizePath(d) {
                var e = +(d == "e"),
                    x = e ? 1 : -1,
                    y = height / 3;
                return "M" + (.5 * x) + "," + y
                    + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                    + "V" + (2 * y - 6)
                    + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                    + "Z"
                    + "M" + (2.5 * x) + "," + (y + 8)
                    + "V" + (2 * y - 8)
                    + "M" + (4.5 * x) + "," + (y + 8)
                    + "V" + (2 * y - 8);
              }
            }
            brush.on("brushstart.chart", function() {
              var div = d3.select(this.parentNode.parentNode.parentNode);
              div.select(".title a").style("display", null);
            });
            brush.on("brush.chart", function() {
              var g = d3.select(this.parentNode),
                  extent = brush.extent();
              if (round) g.select(".brush")
                  .call(brush.extent(extent = extent.map(round)))
                .selectAll(".resize")
                  .style("display", null);
              g.select("#clip-" + id + " rect")
                  .attr("x", x(extent[0]))
                  .attr("width", x(extent[1]) - x(extent[0]));
              dimension.filterRange(extent);
            });
            brush.on("brushend.chart", function() {
              if (brush.empty()) {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", "none");
                div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                dimension.filterAll();
              }
            });
            chart.margin = function(_) {
              if (!arguments.length) return margin;
              margin = _;
              return chart;
            };
            chart.x = function(_) {
              if (!arguments.length) return x;
              x = _;
              axis.scale(x);
              brush.x(x);
              return chart;
            };
            chart.y = function(_) {
              if (!arguments.length) return y;
              y = _;
              return chart;
            };
            chart.dimension = function(_) {
              if (!arguments.length) return dimension;
              dimension = _;
              return chart;
            };
            chart.filter = function(_) {
              if (_) {
                brush.extent(_);
                dimension.filterRange(_);
              } else {
                brush.clear();
                dimension.filterAll();
              }
              brushDirty = true;
              return chart;
            };
            chart.group = function(_) {
              if (!arguments.length) return group;
              group = _;
              return chart;
            };
            chart.round = function(_) {
              if (!arguments.length) return round;
              round = _;
              return chart;
            };
            return d3.rebind(chart, brush, "on");
          }
          });
    });
}

if (Meteor.isServer) {
    Meteor.publish('Data', function() {
      return Data.find();
  });
}
