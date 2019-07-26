
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

    document.getElementById("left-paths-info-all").style.left = "24%";
    document.getElementById("left-restpoints-info-all").style.left = "24%";
}

function closeLeftSidebar() 
{
    document.getElementById("left-sidebar").style.width = "0";
    document.getElementById("left-sidebar-button").style.zIndex = "10";
    document.getElementById("left-sidebar-button").style.opacity = "1";

    document.getElementById("left-paths-info-all").style.left = "3%";
    document.getElementById("left-restpoints-info-all").style.left = "3%";
}

function openRightSidebar() 
{
    document.getElementById("right-sidebar").style.width = "20%";
    document.getElementById("right-sidebar-button").style.zIndex = "-1";
    document.getElementById("right-sidebar-button").style.opacity = "0";

    document.getElementById("right-paths-info-all").style.right = "24%";
    document.getElementById("right-restpoints-info-all").style.right = "24%";
}
  

function closeRightSidebar() 
{
    document.getElementById("right-sidebar").style.width = "0";
    document.getElementById("right-sidebar-button").style.zIndex = "10";
    document.getElementById("right-sidebar-button").style.opacity = "1";

    document.getElementById("right-paths-info-all").style.right = "3%";
    document.getElementById("right-restpoints-info-all").style.right = "3%";
}

function updateInfo(index)
{
    if (dataView[index] == 'paths')
    {
        var start = new Date(pathStartDate[index]).toString();
        var end = new Date(pathEndDate[index]).toString();
        var dateRange = start.split(" ").slice(1,4).join(" ") + " - " + end.split(" ").slice(1,4).join(" ");

        if (index == 0)
        {
            document.getElementById("left-visible-paths-number").innerHTML = PATHSVISUAL[index].length + " / 5530";
            document.getElementById("left-visible-paths-date").innerHTML = pathStartDate[index] == 0 ? "Sep 27 2013 - May 11 2017" : dateRange

        }
        else
        {
            document.getElementById("right-visible-paths-number").innerHTML = PATHSVISUAL[index].length + " / 5530";
            document.getElementById("right-visible-paths-date").innerHTML = pathStartDate[index] == 0 ? "Sep 27 2013 - May 11 2017" : dateRange
        }
    }
    else
    {
        var start = new Date(restpointStartDate[index]).toString();
        var end = new Date(restpointEndDate[index]).toString();
        var dateRange = start.split(" ").slice(1,4).join(" ") + " - " + end.split(" ").slice(1,4).join(" ");

        if (index == 0)
        {
            document.getElementById("left-visible-restpoints-number").innerHTML = RESTPOINTSVISUAL[index].length + " / 80076";
            document.getElementById("left-visible-restpoints-date").innerHTML = restpointStartDate[index] == 0 ? "Jan 23 2013 - Apr 10 2017" : dateRange
        }
        else
        {
            document.getElementById("right-visible-restpoints-number").innerHTML = RESTPOINTSVISUAL[index].length + " / 80076";
            document.getElementById("right-visible-restpoints-date").innerHTML = restpointStartDate[index] == 0 ? "Jan 23 2013 - Apr 10 2017" : dateRange
        }
    }
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

    document.getElementById("right-path-button").className = "ui button";
    document.getElementById("right-restpoints-button").className = "ui button basic";
    togglePaths(true, 1);    

    rightPathsLayer.setProps( {visible: on ? false : dataView[1] == 'paths'});
    rightRestpointsLayer.setProps( {visible: on ? false : dataView[1] == 'restpoints'});

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
        document.getElementById('right-restpoints-button').setAttribute("disabled", "disabled");
    }
    else
    {
        document.getElementById('toggleCompareButton').removeAttribute("disabled");
        document.getElementById('right-path-button').removeAttribute("disabled");
        document.getElementById('right-restpoints-button').removeAttribute("disabled");
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
    var restpointsLayer = (index == 0) ? leftRestpointsLayer : rightRestpointsLayer;

    pathsLayer.setProps({ visible: paths });
    restpointsLayer.setProps({ visible: !paths });

    if (index == 0)
    {
        document.getElementById("leftPathlegend").style.display = paths ? "block" : "none";
        document.getElementById("leftRestpointslegend").style.display = !paths ? "block" : "none";

        document.getElementById("left-paths-info-all").style.display = paths ? "inline-block" : "none";
        document.getElementById("left-restpoints-info-all").style.display = !paths ? "inline-block" : "none";

        document.getElementById("left-path-charts").style.display = paths ? "inline-block" : "none";
        document.getElementById("left-restpoint-charts").style.display = !paths ? "inline-block" : "none";
    }
    else
    {
        document.getElementById("rightPathlegend").style.display = paths ? "block" : "none";
        document.getElementById("rightRestpointslegend").style.display = !paths ? "block" : "none";
        
        document.getElementById("right-paths-info-all").style.display = paths ? "inline-block" : "none";
        document.getElementById("right-restpoints-info-all").style.display = !paths ? "inline-block" : "none";

        document.getElementById("right-path-charts").style.display = paths ? "inline-block" : "none";
        document.getElementById("right-restpoint-charts").style.display = !paths ? "inline-block" : "none";
    }

    dataView[index] = paths ? 'paths' : 'restpoints';
    filterWithPolygons(true, index);
}


///////// RESTPOINTS / PATHS ////////////

$('#left-path-button')
    .click(
        function()
        {
            document.getElementById("left-path-button").className = "ui button";
            document.getElementById("left-restpoints-button").className = "ui button basic";
        
            togglePaths(true, 0);
        }
    );

$('#right-path-button')
    .click(
        function()
        {
            document.getElementById("right-path-button").className = "ui button";
            document.getElementById("right-restpoints-button").className = "ui button basic";
        
            togglePaths(true, 1);
        }
    );

$('#left-restpoints-button')
    .click(
        function()
        {
            document.getElementById("left-path-button").className = "ui button basic";
            document.getElementById("left-restpoints-button").className = "ui button";

            togglePaths(false, 0);
        }
    );

$('#right-restpoints-button')
    .click(
        function()
        {
            document.getElementById("right-path-button").className = "ui button basic";
            document.getElementById("right-restpoints-button").className = "ui button";

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
//                 restpoints.month.filter(null);
//             }
//             else
//             {
//                 paths.month.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });

//                 restpoints.month.filter(function (d)
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
//                 restpoints.weekday.filter(null);
//             }
//             else
//             {
//                 paths.weekday.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });

//                 restpoints.weekday.filter(function (d)
//                 {
//                     return value.map(Number).indexOf(parseInt(d)) > -1;
//                 });
//             }
//         }
//     }
//   )
// ;