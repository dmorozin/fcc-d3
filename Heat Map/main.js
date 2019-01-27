const margin = { left: 90, right: 100, top: 50, bottom: 100 },
  width = 1400 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  colors = ["#313695", "#4575B4", "#74ADD1", "#ABD9E9", "#E0F3F8", "#FFFFBF", "#FEE090", "#FDAE61", "#F46D43", "#D73027", "#A50026"],
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width + margin.left + margin.right);

const g = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(data => {
    console.log(data);
    const temp = data.baseTemperature;
    data = data.monthlyVariance;

    const widthSize = Math.floor(
      width /
        (d3.max(data, function(d) {
          return d.year;
        }) -
          d3.min(data, function(d) {
            return d.year;
          }))
    );

    const heightSize = Math.floor(height / 11);

    //x scale
    const x = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function(d) {
          return d.year;
        })
      )
      .range([0, width]);

    //y scale
    const y = d3
      .scaleBand()
      .domain(data.map(d => d.month))
      .range([0, height]);

    //colors scale
    const colours = d3
      .scaleQuantile()
      .domain(
        d3.extent(data, function(d) {
          return d.variance;
        })
      )
      .range(colors);

    //x axis
    const xAxisCall = d3
      .axisBottom(x)
      .ticks(20)
      .tickFormat(d => {
        return d3.format(d)(d);
      });
    g.append("g")
      .attr("id", "x-axis")
      .style("font-size", "14px")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisCall);

    //y axis
    const yAxisCall = d3
      .axisLeft(y)
      .ticks(10)
      .tickFormat(d => {
        return monthNames[d - 1];
      });
    g.append("g")
      .attr("id", "y-axis")
      .style("font-size", "14px")
      .call(yAxisCall);

    //tooltip
    const tip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return `${d.year} - ${monthNames[d.month - 1]}<br>${d3.format(".2")(temp + d.variance)}°C<br>${d3.format(".1")(d.variance)}°C`;
      });
    svg.call(tip);

    //heatmap
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return x(d.year) + 1;
      })
      .attr("y", function(d) {
        return y(d.month);
      })
      .attr("width", widthSize + 1)
      .attr("height", heightSize - 1.5)
      .style("fill", function(d) {
        return colours(d.variance);
      })
      .on("mouseover", function(d) {
        d3.select(this).style("stroke", "black");
        d3.select(this).style("stroke-opacity", 0.8);
        tip.show(d);
      })
      .on("mouseout", function(d) {
        d3.select(this).style("stroke", "none");
        d3.select(this).style("stroke-opacity", 0);
        tip.hide(d);
      });

    //legend
    const colorLegend = d3
      .legendColor()
      .labelFormat(d3.format(".0f"))
      .scale(colours)
      .shapeWidth(50)
      .shapeHeight(20)
      .orient("horizontal");
    g.append("g")
      .attr("transform", "translate(0, " + (height + 40) + ")")
      .call(colorLegend);
  })
  .catch(err => console.log(err));
