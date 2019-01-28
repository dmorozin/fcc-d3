const margin = { left: 200, right: 100, top: 10, bottom: 0 },
  width = 1400 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom,
  svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);

const g = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

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

var legend = g
  .append("g")
  .attr("class", "key")
  .attr("transform", "translate(0,10)");

legend
  .selectAll("rect")
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

legend
  .append("text")
  .attr("class", "caption")
  .attr("x", x.range()[0])
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold");

legend
  .call(
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

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

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

  g.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .on("mousemove", function(d, e) {
      /*  education.forEach(ed => {
        if(ed.fips === )
      })*/
      div.style("opacity", 0.8);
      div
        .html(getData(d.id, education))
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px");
    })
    .on("mouseout", d => {
      div.style("opacity", 0);
    })
    .attr("fill", function(d) {
      // console.log(edu.get(d.id));
      return color((d.rate = edu.get(d.id)));
    })
    .attr("d", path)
    .append("title");

  g.append("path")
    .datum(
      topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", path);
}

function getData(id, data) {
  let html = "";
  data.forEach(d => {
    if (id === d.fips) {
      html = `${d.area_name}, ${d.state}: ${d.bachelorsOrHigher}%`;
    }
  });
  return html;
}
