const margin = { left: 80, right: 60, top: 50, bottom: 100 },
  width = 900 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width + margin.left + margin.right);

const g = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

const formatSeconds = d3.timeParse("%M:%S");

const yLabel = g
  .append("text")
  .attr("x", -height / 2 + 50)
  .attr("y", -50)
  .attr("transform", "rotate(-90)")
  .attr("font-size", "20px")
  .text("Time in Minutes");

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//legend
const doping = ["No doping allegations", "Riders with doping allegations"];
const dopColor = d3.scaleOrdinal(["green", "red"]);

const legend = g.append("g").attr("transform", "translate(" + (width - 10) + "," + (height - 125) + ")");

doping.forEach(function(dop, i) {
  const legendRow = legend.append("g").attr("transform", "translate(0, " + i * 20 + ")");

  legendRow
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", dopColor(dop));

  legendRow
    .append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .attr("font-size", "12px")
    .text(dop);
});

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then(data => {
    console.log(data);

    const x = d3
      .scaleLinear()
      .domain([
        d3.min(data, function(d) {
          return d.Year - 1;
        }),
        d3.max(data, function(d) {
          return d.Year + 1;
        })
      ])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, function(d) {
          return formatSeconds(d.Time);
        }),
        d3.max(data, function(d) {
          return formatSeconds(d.Time);
        })
      ])
      .range([0, height]);

    const xAxisCall = d3.axisBottom(x).tickFormat(function(d) {
      return d;
    });
    g.append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisCall);

    const yAxisCall = d3.axisLeft(y).tickFormat(function(d) {
      return d3.timeFormat("%M:%S")(d);
    });
    g.append("g")
      .attr("id", "y-axis")
      .call(yAxisCall);

    const circles = g.selectAll("circle").data(data);

    circles
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("cx", d => x(d.Year))
      .attr("cy", d => y(formatSeconds(d.Time)))
      .attr("r", 6)
      .style("stroke", "#4d4d4d")
      .style("fill-opacity", 0.6)
      .attr("fill", d => {
        return d.Doping !== "" ? "red" : "green";
      })
      .on("mouseover", d => {
        div.style("opacity", 0.9);
        div
          .html(tooltipText(d))
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY + 10 + "px");
      })
      .on("mouseout", function(d) {
        div.style("opacity", 0);
      });
  })
  .catch(error => console.log(error));

function tooltipText(data) {
  return data.Doping !== ""
    ? `${data.Name}: ${data.Nationality}<br> Year: ${data.Year}, Time: ${data.Time} <p id="doping">${data.Doping}</p>`
    : `${data.Name}: ${data.Nationality}<br> Year: ${data.Year}, Time: ${data.Time}`;
}
