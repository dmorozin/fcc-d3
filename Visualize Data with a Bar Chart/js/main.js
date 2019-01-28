const margin = { left: 80, right: 60, top: 50, bottom: 100 },
  width = 1100 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

const formatNum = d3.format("$,");

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// X Label
g.append("text")
  .attr("y", height + 50)
  .attr("x", width / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Year");

// Y Label
g.append("text")
  .attr("y", 20)
  .attr("x", -(height / 2 - 50))
  .attr("font-size", "17px")
  .attr("transform", "rotate(-90)")
  .text("Gross Domestic Product");

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(data => {
    console.log(data);
    data.data.forEach(d => {
      d[0] = new Date(d[0]);
    });

    //x scale
    const x = d3
      .scaleTime()
      .domain(
        d3.extent(data.data, function(d) {
          return d[0];
        })
      )
      .range([0, width]);

    // Y Scale
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data.data, function(d) {
          return d[1];
        })
      ])
      .range([height, 0]);

    // X Axis
    const xAxisCall = d3.axisBottom(x);
    g.append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisCall);

    // Y Axis
    const yAxisCall = d3.axisLeft(y).tickFormat(function(d) {
      return formatNum(d);
    });
    g.append("g")
      .attr("id", "y-axis")
      .call(yAxisCall);

    const rects = g.selectAll("rect").data(data.data);

    rects
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", function(d) {
        return y(d[1]);
      })
      .attr("x", function(d) {
        return x(d[0]);
      })
      .attr("height", function(d) {
        return height - y(d[1]);
      })
      .attr("width", "5px")
      .attr("fill", "#33ADFF")
      .on("mouseover", function(d) {
        d3.select(this).attr("fill", "#fff");
        div
          .transition()
          .duration(200)
          .style("opacity", 0.8);
        div
          .html(formatDate(d[0]) + "<br/>" + formatNum(d[1]) + " Billion")
          .style("left", d3.event.pageX + 30 + "px")
          .style("top", "60%");
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("fill", "#33ADFF");
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  })
  .catch(err => console.log(err));

function formatDate(date) {
  const month = date.getMonth();
  const year = date.getFullYear();
  let quarter = "";
  switch (month) {
    case 0:
      quarter = "Q1";
      break;
    case 3:
      quarter = "Q2";
      break;
    case 6:
      quarter = "Q3";
      break;
    case 9:
      quarter = "Q4";
      break;
  }
  return year + " " + quarter;
}
