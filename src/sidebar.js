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

var width = 0.16 * window.innerWidth;

var charts = 
[
    // barChart()
    //     .dimension(paths.month)
    //     .group(paths.month.group())
    //     .dimension2(staypoints.month)
    //     .x(d3.scale.linear()
    //         .domain([1,13])
    //         .rangeRound([0, width], .1))
    //     .tickLabels(["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
    //     .numTicks(13),
    barChart()
        .dimension(paths.month)
        .group(paths.month.group())
        .dimension2(staypoints.month)
        .x(d3.scale.linear()
            .domain([1,13])
            .rangeRound([0, width]))
        .tickLabels(["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
        .numTicks(13),

    barChart()
        .dimension(paths.weekday)
        .group(paths.weekday.group())
        .dimension2(staypoints.weekday)
        .x(d3.scale.linear()
        .domain([0, 7])
        .rangeRound([0, width]))
        .tickLabels(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        .numTicks(8),

    barChart()
        .dimension(paths.hour)
        .group(paths.hour.group())
        .dimension2(staypoints.hour)
        .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, width]))
        .tickLabels([...Array(25).keys()])
        .numTicks(13),
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

$('#path-button')
    .click(
        function()
        {
            document.getElementById("path-button").className = "ui teal button";
            document.getElementById("staypoints-button").className = "ui teal button basic";
            map.removeLayer('staypointsLayer');
            map.addLayer(pathsLayer);
        }
    );

$('#staypoints-button')
    .click(
        function()
        {
            document.getElementById("path-button").className = "ui teal button basic";
            document.getElementById("staypoints-button").className = "ui teal button";
            map.removeLayer('pathsLayer');
            map.addLayer(staypointsLayer);
        }
    );


// $('#month-select')
//   .dropdown(
//     {
//         onChange: function(value, text, $selectedItem)
//         {
//             if (value.length <= 0)
//             {
//                 paths.month.filter(null);
//                 staypoints.month.filter(null);
//             }
//             else
//             {
//                 paths.month.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });

//                 staypoints.month.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });
//             }
//         }
//     }
//   )
// ;

// $('#weekday-select')
//   .dropdown(
//     {
//         onChange: function(value, text, $selectedItem)
//         {
//             if (value.length <= 0)
//             {
//                 paths.weekday.filter(null);
//                 staypoints.weekday.filter(null);
//             }
//             else
//             {
//                 paths.weekday.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });

//                 staypoints.weekday.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });
//             }
//         }
//     }
//   )
// ;