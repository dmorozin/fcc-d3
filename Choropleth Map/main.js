const margin = { left: 200, right: 100, top: 10, bottom: 0 },
  width = 1400 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom,
  svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);

const g1 = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var path = d3.geoPath();

var edu = d3.map();

var x = d3
  .scaleLinear()
  .domain([2.6, 75.1])
  .rangeRound([500, 800]);

var color = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, 9))
  .range(d3.schemeGreens[9]);

var g = g1
  .append("g")
  .attr("class", "key")
  .attr("transform", "translate(0,10)");

g.selectAll("rect")
  .data(
    color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    })
  )
  .enter()
  .append("rect")
  .attr("height", 8)
  .attr("x", function(d) {
    return x(d[0]);
  })
  .attr("width", function(d) {
    return x(d[1]) - x(d[0]);
  })
  .attr("fill", function(d) {
    return color(d[0]);
  });

g.append("text")
  .attr("class", "caption")
  .attr("x", x.range()[0])
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold")
  .text("Unemployment rate");

g.call(
  d3
    .axisBottom(x)
    .tickSize(15)
    .tickFormat(function(x, i) {
      x = Math.round(x);
      return x != 75 ? x + "%" : "";
    })
    .tickValues(color.domain())
)
  .select(".domain")
  .remove();

const promises = [
  d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"),
  d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")
];

Promise.all(promises)
  .then(function(data) {
    ready(data[0], data[1]);
  })
  .catch(err => console.log(err));

function ready(us, education) {
  education.forEach(function(d) {
    edu.set(d.fips, +d.bachelorsOrHigher);
  });
  console.log(d3.extent(education, d => d.bachelorsOrHigher));

  g1.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("fill", function(d) {
      return color((d.rate = edu.get(d.id)));
    })
    .attr("d", path)
    .append("title")
    .text(function(d) {
      return d.rate + "%";
    });

  g1.append("path")
    .datum(
      topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", path);
}
