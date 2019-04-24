function openSidebar() 
{
    document.getElementById("sidebar").style.width = "20%";
    document.getElementById("main").style.zIndex = "-1";
    document.getElementById("main").style.opacity = "0";
}
  
function closeSidebar() 
{
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main").style.zIndex = "1";
    document.getElementById("main").style.opacity = "1";
}

var charts = 
[
    barChart()
        .dimension(paths.hour)
        .group(paths.hour.group())
        .dimension2(staypoints.hour)
        .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 15 * 24]))
        .round(d3.time.round),
];

var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

renderAll();

// Renders the specified chart or list.
function render(method) 
{
    d3.select(this).call(method);
}

// Whenever the brush moves, re-rendering everything.
function renderAll() 
{
    chart.each(render);
}

$('#month-select')
  .dropdown(
    {
        onChange: function(value, text, $selectedItem)
        {
            if (value.length <= 0)
            {
                paths.month.filter(null);
                staypoints.month.filter(null);
            }
            else
            {
                paths.month.filter(function (d)
                {
                    return value.map(Number).indexOf(parseInt(d)) > -1;
                });

                staypoints.month.filter(function (d)
                {
                    return value.map(Number).indexOf(parseInt(d)) > -1;
                });
            }
        }
    }
  )
;

$('#weekday-select')
  .dropdown(
    {
        onChange: function(value, text, $selectedItem)
        {
            if (value.length <= 0)
            {
                paths.weekday.filter(null);
                staypoints.weekday.filter(null);
            }
            else
            {
                paths.weekday.filter(function (d)
                {
                    return value.map(Number).indexOf(parseInt(d)) > -1;
                });

                staypoints.weekday.filter(function (d)
                {
                    return value.map(Number).indexOf(parseInt(d)) > -1;
                });
            }
        }
    }
  )
;