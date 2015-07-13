define(["d3"], function (d3) {
  var margin = { top: 10, right: 15, bottom: 20, left: 40 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

  var formatDate = d3.time.format("%d.%m.%Y %H:%M")

  return function (selector, title, id, datasets) {
    var container = d3.select(selector)

    container.html("<h2>" + title + "</h2><div id=\"" + id + "\"></div><ul class=\"datasets\"></ul>")


    var chart = container.select("div#" + id)
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .classed("svg-content-responsive", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var y = d3.scale.linear()
        .range([height, 0])

    var x = d3.time.scale()
        .range([0, width])

    function full(d) {
        return d > 0.01 ? 0 : height
    }

    function paintBarGraph(error, data) {
        if (error) return console.warn(error)

        chart.selectAll("*").remove()

        data.forEach(function (d) { d.Start = new Date(d.Start) })

        y.domain([
            d3.min(data, function (d) { return d.Offline > 0.01 ? null : d.Min }) * .95,
            d3.max(data, function (d) { return d.Max }) * 1.05])

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")

        x.domain([data[0].Start, data[data.length - 1].Start])

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")

        var barWidth = width / data.length

        var bar = chart.selectAll("g")
            .data(data)
            .enter().append("g")

        var focus = chart.append("g")
            .attr("class", "graphfocus")
            .attr("width", width)
            .attr("transform", "translate(" + width + ",0)")

        focus.append("text")
            .attr("class", "graphtexthead")
            .attr("dy", "1em")

        focus.append("text")
            .attr("class", "graphtextmin")
            .attr("dy", "2.5em")

        focus.append("text")
            .attr("class", "graphtextmax")
            .attr("dy", "4em")

        focus.append("text")
            .attr("class", "graphtextavg")
            .attr("dy", "5.5em")

        bar.append("rect")
            .attr("y", function (d) { return y(d.Max) })
            .attr("x", function (d) { return x(d.Start) })
            .attr("class", "graphbar graphbarmax")
            .attr("height", function (d) { return height - y(d.Max) })
            .attr("width", barWidth - 1)

        bar.append("rect")
            .attr("y", function (d) { return y(d.Min) })
            .attr("x", function (d) { return x(d.Start) })
            .attr("class", "graphbar graphbarmin")
            .attr("height", function (d) { return height - y(d.Min) })
            .attr("width", barWidth - 1)

        bar.append("rect")
            .attr("y", function (d) { return full(d.Offline) })
            .attr("x", function (d) { return x(d.Start) })
            .attr("class", "graphoffline")
            .attr("height", function (d) { return height - full(d.Offline) })
            .attr("width", barWidth)

        bar.append("rect")
            .attr("y", function () { return 0 })
            .attr("x", function (d) { return x(d.Start) })
            .attr("class", "graphoverlay")
            .attr("height", function () { return height })
            .attr("width", barWidth)
            .on("mouseover", function (d) {
                d3.select(this).attr("class", "graphhighlight")
                focus.select(".graphtexthead").html(formatDate(d.Start))
                if(d.Offline > 0.01)
                    focus.select(".graphtextmin").html("Offline")
                else {
                    focus.select(".graphtextmin").html("Minimum: " + d.Min)
                    focus.select(".graphtextmax").html("Maximum: " + d.Max)
                    focus.select(".graphtextavg").html("Mittel: " + d.WeightedAverage.toFixed(0))
                }
            })
            .on("mouseout", function () {
                d3.select(this).attr("class", "graphoverlay")
                focus.selectAll("text").html(null)
            })

        chart.append("g")
            .attr("class", "graphx graphaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

        chart.append("g")
            .attr("class", "graphy graphaxis")
            .call(yAxis)

    }

    var setList = container.select("ul.datasets")
    datasets.forEach(function(set) {
      setList.append("li")
        .html(set.name)
        .datum(set)
        .on("click", function(d) {
            setList.selectAll("li").classed("highlighted", false)
            d3.select(this).classed("highlighted", true)
            d3.json(d.url, paintBarGraph)
        })
    })

    setList.select(":first-child").classed("highlighted", true)
    d3.json(datasets[0].url, paintBarGraph)
  }
})
