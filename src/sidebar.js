
var leftChart = d3.selectAll(".left-chart")
      .data(leftCharts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

var rightChart = d3.selectAll(".right-chart")
      .data(rightCharts)
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
    leftChart.each(render);
    rightChart.each(render);
}

function openLeftSidebar() 
{
    document.getElementById("left-sidebar").style.width = "20%";
    document.getElementById("left-sidebar-button").style.zIndex = "-1";
    document.getElementById("left-sidebar-button").style.opacity = "0";
}

function closeLeftSidebar() 
{
    document.getElementById("left-sidebar").style.width = "0";
    document.getElementById("left-sidebar-button").style.zIndex = "10";
    document.getElementById("left-sidebar-button").style.opacity = "1";
}

function openRightSidebar() 
{
    document.getElementById("right-sidebar").style.width = "20%";
    document.getElementById("right-sidebar-button").style.zIndex = "-1";
    document.getElementById("right-sidebar-button").style.opacity = "0";
}
  

function closeRightSidebar() 
{
    document.getElementById("right-sidebar").style.width = "0";
    document.getElementById("right-sidebar-button").style.zIndex = "10";
    document.getElementById("right-sidebar-button").style.opacity = "1";
}


///////// COMPARE ////////////

$("#toggleCompareButton").click(toggleCompare);

var compareVisible = false;
function toggleCompare()
{
    setCompare(!compareVisible);
}

function setCompare(visible)
{
    $("#leftContainer").css({ "visibility": (visible ? "visible" : "hidden"), "opacity": (visible ? "1" : "0") });
    map._setPosition(visible ? $(document).width() / 2 : 0);
    compareVisible = visible;
}


///////// ANIMATE ////////////

$("#toggleAnimateButton").click(toggleAnimation);

function toggleAnimation()
{
    setAnimation(!animating);
}

function setAnimation(on)
{
    if (compareVisible) 
        $("#toggleCompareButton").click();

    rightPathsLayer.setProps( {visible: on ? false : dataView == 'paths'});
    rightStaypointsLayer.setProps( {visible: on ? false : dataView == 'staypoints'});

    var animatedPathsLayer = new TripsLayer
    ({
        id: 'animatedPathsLayer',
        // type: TripsLayer,
        data: ANIMATEPATHS,
        getPath: p => p.path,
        getColor: p => p.azimuthColor,
        opacity: 0.02 * (maxPaths / ANIMATEPATHS.length),
        widthMinPixels: 2,
        rounded: true,
        trailLength: 480,
        currentTime: 0,
        visible: on
    })

    deckgl.setProps({ layers: [animatedPathsLayer] });

    if (on)
    {
        document.getElementById('toggleCompareButton').setAttribute("disabled", "disabled");
        document.getElementById('right-path-button').setAttribute("disabled", "disabled");
        document.getElementById('right-staypoints-button').setAttribute("disabled", "disabled");
    }
    else
    {
        document.getElementById('toggleCompareButton').removeAttribute("disabled");
        document.getElementById('right-path-button').removeAttribute("disabled");
        document.getElementById('right-staypoints-button').removeAttribute("disabled");
    }

    animating = on;
}

$("#restartAnimateButton")
    .click(
        function()
        {
            start = Date.now();
        }
    );

function togglePaths(paths, index)
{
    var pathsLayer = (index == 0) ? leftPathsLayer : rightPathsLayer;
    var staypointsLayer = (index == 0) ? leftStaypointsLayer : rightStaypointsLayer;

    pathsLayer.setProps({ visible: paths });
    staypointsLayer.setProps({ visible: !paths });

    document.getElementById("left-path-charts").style.display = paths ? "inline-block" : "none";
    document.getElementById("right-path-charts").style.display = paths ? "inline-block" : "none";

    document.getElementById("left-staypoint-charts").style.display = !paths ? "inline-block" : "none";
    document.getElementById("right-staypoint-charts").style.display = !paths ? "inline-block" : "none";

    dataView = paths ? 'paths' : 'staypoints';
    filterWithPolygons(true, index);
}


///////// STAYPOINTS / PATHS ////////////

$('#left-path-button')
    .click(
        function()
        {
            document.getElementById("left-path-button").className = "ui button";
            document.getElementById("left-staypoints-button").className = "ui button basic";
        
            togglePaths(true, 0);
        }
    );

$('#right-path-button')
    .click(
        function()
        {
            document.getElementById("right-path-button").className = "ui button";
            document.getElementById("right-staypoints-button").className = "ui button basic";
        
            togglePaths(true, 1);
        }
    );

$('#left-staypoints-button')
    .click(
        function()
        {
            document.getElementById("left-path-button").className = "ui button basic";
            document.getElementById("left-staypoints-button").className = "ui button";

            togglePaths(false, 0);
        }
    );

$('#right-staypoints-button')
    .click(
        function()
        {
            document.getElementById("right-path-button").className = "ui button basic";
            document.getElementById("right-staypoints-button").className = "ui button";

            togglePaths(false, 1);
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