const margin = { top: 40, right: 10, bottom: 40, left: 10 },
  width = 960 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom,
  legendHeight = 150,
  legendWidth = width;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("height", height)
  .attr("width", width);

const legendSvg = d3
  .select("#legend-area")
  .append("svg")
  .attr("height", legendHeight)
  .attr("width", legendWidth);

/*var fader = function(color) {
    return d3.interpolateRgb(color, "#fff")(0.2);
  },
  color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),*/
var format = d3.format(",d");

var treemap = d3
  .treemap()
  .tile(d3.treemapResquarify)
  .size([width, height])
  .round(true)
  .paddingInner(1);

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.json("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json")
  .then(data => {
    console.log(data);
    // console.log(d3.hierarchy(data));

    // Since we are dealing with hierarchical data, need to convert the data to the right format
    var root = d3
      .hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum(sumBySize)
      .sort(function(a, b) {
        return b.height - a.height || b.value - a.value;
      });

    console.log(root);

    var platforms = root.data.children.map(d => d.id);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    //console.log(root.data.children);

    // Computes x0, x1, y0, and y1 for each node (where the rectangles should be)
    // Computes x0, x1, y0, and y1 for each node (where the rectangles should be)
    treemap(root);

    var cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      })
      .on("mousemove", (d, e) => {
        div.style("opacity", 1);
        div
          .html(`Name: ${d.data.name} <br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 20 + "px");
      })
      .on("mouseout", d => {
        div.style("opacity", 0);
      });

    // Add rectanges for each of the boxes that were generated
    cell
      .append("rect")
      .attr("id", function(d) {
        return d.data.id;
      })
      .attr("width", function(d) {
        return d.x1 - d.x0;
      })
      .attr("height", function(d) {
        return d.y1 - d.y0;
      })
      .attr("fill", function(d) {
        return color(d.parent.data.id);
      });

    // Make sure that text labels don't overflow into adjacent boxes
    cell.append("clipPath").attr("id", function(d) {
      return "clip-" + d.data.id;
    });

    // Add text labels - each word goes on its own line
    cell
      .append("text")

      .selectAll("tspan")
      .data(function(d) {
        return d.data.name.split(/(?=[A-Z][^A-Z])/g);
      })
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) {
        return 13 + i * 10;
      })
      .text(function(d) {
        return d;
      });

    //legend
    var legend = legendSvg.append("g").attr("transform", "translate(" + (legendWidth / 2 - 50) + ",10)");

    platforms.forEach(function(platform, i) {
      var legendRow;
      if (i >= 0 && i <= 5) legendRow = legend.append("g").attr("transform", "translate(0, " + i * 20 + ")");
      else if (i >= 6 && i <= 11) legendRow = legend.append("g").attr("transform", "translate(100, " + (i * 20 - 120) + ")");
      else legendRow = legend.append("g").attr("transform", "translate(200, " + (i * 20 - 240) + ")");

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(platform));

      legendRow
        .append("text")
        .attr("x", -10)
        .attr("y", 15)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(platform.substring(platform.indexOf(".") + 1));
    });
  })
  .catch(err => console.log(err));

// Return the size of the node
function sumBySize(d) {
  return d.value;
}
