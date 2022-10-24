let button_group = document.querySelectorAll(".groupby-buttons");
let ticker_input = document.querySelector("#ticker_input");

const get_url = (symbol, group) => {
  const url_mapping = {
    hour: `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&apikey=FFH6ASIVHN8DOSK5`,
    day: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    week: `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    month: `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    year: `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    "1d": `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=30min&apikey=FFH6ASIVHN8DOSK5`,
    "5d": `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&apikey=FFH6ASIVHN8DOSK5`,
    "1mo": `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    "6mo": `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=FFH6ASIVHN8DOSK5`,
    ytd: `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    "1y": `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    "5y": `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
    max: `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=FFH6ASIVHN8DOSK5`,
  };
  return url_mapping[group];
};

const fetchStockPriceData = (ticker = "MSFT", group = "hour") => {
  fetch(get_url(ticker, group))
    .then((response) => response.json())
    .then((result) => {
    
      const date = result["Meta Data"]["3. Last Refreshed"];
      const stock_data =
        result[
          Object.keys(result).filter((item) =>
            item.toLowerCase().includes("time series")
          )
        ];
      const chart_data = format_stock_data(stock_data, group, date);
      console.log(chart_data);
      render_chart(chart_data);
    })
    .catch((error) => { 
      alert("Thank you for using Alpha Vantage! Our standard AP…would like to target a higher API call frequency. Please Try after a few minutes");
    });
};

const format_stock_data = (data, group, date) => {
  let chart_data = [];
  for (let key in data) {
    chart_data.push({
      date: new Date(key),
      open: data[key]["1. open"],
      high: data[key]["2. high"],
      low: data[key]["3. low"],
      close: data[key]["4. close"],
    });
  }
  let sorted_data = chart_data.sort((a, b) => b["date"] - a["date"]);
  let to_date,from_date;
  switch (group) {
    case "1d":
      return sorted_data.filter(
        (item) =>
          new Date(item["date"]).toLocaleDateString() ==
          new Date(date).toLocaleDateString()
      );
    case "1mo":
      return sorted_data.filter(
        (item) => new Date(item["date"]).getMonth() == new Date(date).getMonth()
      );
    case "6mo":
      return sorted_data.filter(
        (item) =>
          new Date(item["date"]).getFullYear() ==
            new Date(date).getFullYear() &&
          Math.abs(
            new Date(item["date"]).getMonth() - new Date(date).getMonth()
          ) < 6
      );
    case "ytd":
      return sorted_data.filter(
        (item) =>
          new Date(item["date"]).getFullYear() == new Date(date).getFullYear()
      );
    case "1y":
      to_date = new Date(date).getTime();
      from_date = new Date(new Date(date).setDate(new Date(date).getDate()-365)).getTime();
      return sorted_data.filter(
        item=>
        item["date"].getTime()<=to_date && item["date"].getTime() >= from_date
      );
      
    case "5y":
      to_date = new Date(date).getTime();
      from_date = new Date(new Date(date).setDate(new Date(date).getDate()-(365*5))).getTime();
      return sorted_data.filter(
          item=>
          item["date"].getTime()<=to_date && item["date"].getTime() >= from_date
        )
    default:
      return sorted_data;
    
  }
  // return sorted_data;
};

const render_chart = (data) => {
  let element = document.getElementById("chart-container");
  let bbox = element.getBoundingClientRect();
  let width = bbox?.width || 0;
  let height = (bbox?.height || 0) - 35;
  let margin = { left: 30, right: 35, top: 40, bottom: 40 };
  let innerHeight = height - margin.top - margin.bottom;
  let innerWidth = width - margin.right - margin.left;
  let x = "date";
  let y = "low";

  d3.select(element).html(null);
  d3.select("body").selectAll(".linechart_tooltip").remove();

  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "linechart-tooltip")
    .style("display", "none")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background-color", "#000")
    .style("opacity", 0.5)
    .style("color", "#fff")
    .style("border", "2px solid #000")
    .style("border-radius", "10px");

  let svg = d3
    .select(element)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  let xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (item) => item["date"]))
    .range([0, innerWidth]);

  let max_val = d3.max([
    Math.ceil(d3.max(data, (data) => +data["high"])),
    Math.ceil(d3.max(data, (data) => +data["low"])),
    Math.ceil(d3.max(data, (data) => +data["close"])),
  ]);
  let min_val = d3.min([
    Math.floor(d3.min(data, (data) => +data["high"])),
    Math.floor(d3.min(data, (data) => +data["low"])),
    Math.floor(d3.min(data, (data) => +data["close"])),
  ]);

  let yScale = d3
    .scaleLinear()
    .domain([Math.round(min_val) - 20, Math.round(max_val) + 20])
    .range([innerHeight, 0])
    .nice();

  let initLine = d3
    .line()
    .curve(d3.curveLinear)
    .x((d) => xScale(d[x]) || 0)
    .y(innerHeight);

  let line = d3
    .line()
    .curve(d3.curveLinear)
    .x((d) => xScale(d[x]))
    .y((d) => yScale(d[y]));

  let g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(10));

  g.append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(-innerWidth)
        .ticks(5)
        .tickFormat((d) => d3.format(".2s")(d))
    );

  g.append("path")
    .data([data])
    .attr("class", "line1")
    .attr("d", (d) => initLine(d))
    .attr("fill", "transparent")
    .attr("stroke", "#ff00ff")
    .attr("stroke-width", 2)
    .transition()
    .duration(2500)
    .attr("d", (d) => line(d));
  y = "close";
  g.append("path")
    .data([data])
    .attr("class", "line1")
    .attr("d", (d) => initLine(d))
    .attr("fill", "transparent")
    .attr("stroke", "#00ffff")
    .attr("stroke-width", 2)
    .transition()
    .duration(2500)
    .attr("d", (d) => line(d));
    y = "high";
    g.append("path")
      .data([data])
      .attr("class", "line2")
      .attr("d", (d) => initLine(d))
      .attr("fill", "transparent")
      .attr("stroke", "#0000ff")
      .attr("stroke-width", 2)
      .transition()
      .duration(2500)
      .attr("d", (d) => line(d));
  g.selectAll(".dashed-line")
    .data(data)
    .enter()
    .append("line")
    .attr("class", (d, i) => "dashed-line" + i)
    .attr("x1", (d) => xScale(d["date"]))
    .attr("x2", (d) => xScale(d["date"]))
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", "transparent")
    .attr("stroke-width", "2px")
    .style("cursor", "pointer")
    // .style("stroke-dasharray", "3, 3")
    .on("mouseover", mouseHanlder)
    .on("mousemove", mouseHanlder)
    .on("mouseout", (d, i) => {
      d3.select(".dashed-line" + i).attr("stroke", "transparent");
      return tooltip
        .style("display", "none")
        .style("position", "absolute")
        .style("z-index", "10");
    })
    .transition()
    .duration(2500);

  function mouseHanlder(d, i) {
    let tooltipHtmlText = `
          <div class="tooltip-text-wrapper">
            <div class="legends">
              <span class="text-format"><strong>Date</strong>:</span>
              <span class="text-format pl-2"> ${d[
                "date"
              ].toLocaleString()}</span>
            </div>
            <div class="legends">
              <span class="text-format"><strong>Low</strong>:</span>
              <span class="text-format pl-2">${d["low"]}</span>
            </div>
            <div class="legends">
              <span class="text-format"><strong>High</strong>:</span>
              <span class="text-format pl-2">${d["high"]}</span>
            </div>
            <div class="legends">
              <span class="text-format"><strong>Close</strong>:</span>
              <span class="text-format pl-2">${d["close"]}</span>
            </div>
            <div class="legends">
              <span class="text-format"><strong>Open</strong>:</span>
              <span class="text-format pl-2">${d["open"]}</span>
            </div>
          </div>`;
    d3.select(".dashed-line" + i)
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.3);
    tooltip.style("display", "block").html(function () {
      return tooltipHtmlText;
    });
    let xpos = event.x > innerWidth / 2 ? event.x - 230 : event.x + 10;
    tooltip.style("left", xpos + "px").style("top", event.y + "px");
  }
  svg.selectAll(` .x-axis .domain`).attr("stroke", "rgba(0,0,0,.5)");
  svg.selectAll(` .x-axis .tick line`).attr("stroke", "rgba(0,0,0,.5)");
  svg.selectAll(` .x-axis .tick text`).attr("fill", "rgba(0,0,0,.9)");
  svg.selectAll(` .y-axis .domain`).attr("stroke", "rgba(0,0,0,.5)");
  svg.selectAll(` .y-axis .tick line`).attr("stroke", "rgba(0,0,0,.5)");
  svg
    .selectAll(` .y-axis .tick text`)
    .attr("fill", "rgba(0,0,0,.9)")
    .style("font-size", 10);
};

fetchStockPriceData(ticker_input.value,"1d");

button_group.forEach((button) => {
  button.addEventListener("click", (ev) => {
    button_group.forEach(button=>{
      button.classList.remove("active");
    })
    ev.target.classList.add("active");
    if (ticker_input.value == "") {
      alert("Please Enter Ticker Symbol");
      return;
    }

    fetchStockPriceData(ticker_input.value, ev.target.dataset.id);
  });
});
