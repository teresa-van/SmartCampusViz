/*
    Filters: 
        [lowerBound, upperBound] <- Select all values that range between lower and upper bound
        value <- Select value equal to value
        function(d) { return d } <- Select values equal to result of the function
        null <- Select all (remove filter)
*/

var pathsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/paths.json";
var pathsjson;

var staypointsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/staypoints.json";
var staypointsjson;

// #region Load stuff

function loadJSON(callback,  URL)
{
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', URL, false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function ()
    {
        if (xobj.readyState == 4 && xobj.status == "200")
        {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

loadJSON(function (response)
{
    pathsjson = JSON.parse(response);
}, pathsURL);

loadJSON(function (response)
{
    staypointsjson = JSON.parse(response);
}, staypointsURL);

// #endregion

// Paths variables
var filteredPathIDs = [];
var pathCoordinateIDs = {};
const paths = crossfilter(pathsjson);
const maxPaths = paths.groupAll().reduceCount().value();

// Staypoint variables
filteredCentroidLon = [];
filteredCentroidLat = [];
const staypoints = crossfilter(staypointsjson);
const maxStaypoints = staypoints.groupAll().reduceCount().value();

configurePathsFilter();
configureStaypointsFilter();


// paths.month.filter(6);
// paths.weekday.filter(0);
// paths.id.filter([0,4]);
// paths.academicDay.filter('BETWEEN_TERMS');
// staypoints.academicDayStart.filter('BETWEEN_TERMS');

// #region Paths

function filterPathsPassingThroughPolygons()
{
    // Filter
    if (filteredPathIDs.length > 0)
    {
        paths.id.filter(function (d)
        {
            return filteredPathIDs.indexOf(d) > -1;
        });
    }
    else
        alert("No points pass through these polygons.");
}

function findPathsPassingThroughPolygon()
{
    pathCoordinateIDs = {};
    
    var pathCoordinates = [];
    paths.allFiltered().forEach(function (d)
    {
        pathCoordinateIDs[[d.Lon, d.Lat]] = d.Path_ID;
        pathCoordinates.push([d.Lon, d.Lat]);
    });

    var pointsWithinPoly = findPointsWithinAPolygon(pathCoordinates, allPolyPoints[Object.keys(allPolyPoints)[Object.keys(allPolyPoints).length-1]], true);
    if (Object.keys(allPolyPoints).length == 1) filteredPathIDs = pointsWithinPoly;
    else filteredPathIDs = filteredPathIDs.filter(x => pointsWithinPoly.includes(x))   

    // Filter
    filterPathsPassingThroughPolygons();
}

function findPathsPassingThroughAllPolygons()
{
    pathCoordinateIDs = {};
    paths.id.filter(null);
    
    var pathCoordinates = [];
    paths.allFiltered().forEach(function (d)
    {
        pathCoordinateIDs[[d.Lon, d.Lat]] = d.Path_ID;
        pathCoordinates.push([d.Lon, d.Lat]);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(pathCoordinates, true);

    if (Object.keys(allPolyPoints).length == 0) filteredPathIDs = [];
    else filteredPathIDs = pointsWithinAllPoly[0];

    // Intersect all points on path with all points within each polygon, add to filter list if there exists a point in each polygon
    for (var p in pointsWithinAllPoly)
        filteredPathIDs = filteredPathIDs.filter(x => pointsWithinAllPoly[p].includes(x))   

    // Filter
    filterPathsPassingThroughPolygons();
}

function configurePathsFilter()
{
    try 
    {
        paths.id = paths.dimension(function (d) { return d.Path_ID }),
        paths.pointId = paths.dimension(function (d) { return d.Path_Point_ID }),
        paths.date = paths.dimension(function (d) { return d.Loct }), // Needs to parse properly

        paths.day = paths.dimension(function (d) { return parseInt(d.Loct.split(" ")[0].split("-")[0]) }),
        paths.month = paths.dimension(function (d) { return parseInt(d.Loct.split(" ")[0].split("-")[1]) }),
        paths.year = paths.dimension(function (d) { return parseInt(d.Loct.split(" ")[0].split("-")[2]) }),
        paths.weekday = paths.dimension(function (d) { 
            var date = d.Loct.split(" ")[0].split("-");
            var day = new Date(date[1]+"-"+date[0]+"-"+date[2]);
            return parseInt(day.getDay());
        }),

        paths.hour = paths.dimension(function (d) { return parseInt(d.Loct.split(" ")[1].split(":")[0]) }),
        paths.minute = paths.dimension(function (d) { return parseInt(d.Loct.split(" ")[1].split(":")[1]) }),

        paths.academicDay = paths.dimension(function (d) { return d.Academic_Day }),
        paths.buildingId = paths.dimension(function (d) { return d.Building_ID }),
        paths.buildingName = paths.dimension(function (d) { return d.Building_Name }),
        paths.latitude = paths.dimension(function (d) { return d.Lat }),
        paths.longitude = paths.dimension(function (d) { return d.Lon }),
        paths.distanceToNext = paths.dimension(function (d) { return d.Distance_To_Next }),
        paths.minutesToNext = paths.dimension(function (d) { return d.Minutes_To_Next }),
        paths.maxTemp = paths.dimension(function (d) { return d.Max_Temp_C }),
        paths.meanTemp = paths.dimension(function (d) { return d.Mean_Temp_C }),
        paths.totalPrecip = paths.dimension(function (d) { return d.Total_Precip_mm }),
        paths.snow = paths.dimension(function (d) { return d.Snow_cm }),
        paths.azimuthPath = paths.dimension(function (d) { return d.Azimuth_Path }),
        paths.azimuthSegment = paths.dimension(function (d) { return d.Azimuth_Segment }),
        paths.speed = paths.dimension(function (d) { return d.Speed });
    }
    catch (e) { console.log(e.stack); }
}

// #endregion

// #region Staypoints

function filterStaypointsWithinPolygons()
{
    // Filter
    if (filteredCentroidLon.length > 0)
    {
        staypoints.centroidLon.filter(function (d)
        {
            return filteredCentroidLon.indexOf(d) > -1;
        });
    }
    if (filteredCentroidLat.length > 0)
    {
        staypoints.centroidLat.filter(function (d)
        {
            return filteredCentroidLat.indexOf(d) > -1;
        });
    }
}

function findStaypointsWithinPolygon()
{
    staypoints.centroidLon.filter(null);
    staypoints.centroidLat.filter(null);

    var staypointCoordinates = [];
    staypoints.allFiltered().forEach(function (d)
    {
        staypointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
    });

    var pointsWithinPoly = findPointsWithinAPolygon(staypointCoordinates, allPolyPoints[Object.keys(allPolyPoints)[Object.keys(allPolyPoints).length-1]], false);
    filteredCentroidLon = filteredCentroidLon.concat(pointsWithinPoly.lons);
    filteredCentroidLat = filteredCentroidLat.concat(pointsWithinPoly.lats);

    // Filter
    filterStaypointsWithinPolygons();
}

function findStaypointsWithinAllPolygons()
{
    filteredCentroidLon = [];
    filteredCentroidLat = [];

    staypoints.centroidLon.filter(null);
    staypoints.centroidLat.filter(null);

    var staypointCoordinates = [];
    staypoints.allFiltered().forEach(function (d)
    {
        staypointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(staypointCoordinates, false);

    for (var p in pointsWithinAllPoly)
    {
        filteredCentroidLon = filteredCentroidLon.concat(pointsWithinAllPoly[p].lons);
        filteredCentroidLat = filteredCentroidLat.concat(pointsWithinAllPoly[p].lats);
    }

    // Filter
    filterStaypointsWithinPolygons();
}

function configureStaypointsFilter()
{
    try 
    {
        staypoints.loctStart = staypoints.dimension(function (d) { return d.Loct_Start }),
        staypoints.loctEnd = staypoints.dimension(function (d) { return d.Loct_End }),

        staypoints.day = staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[0]) }),
        staypoints.month = staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[1]) }),
        staypoints.year = staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[2]) }),
        staypoints.weekday = staypoints.dimension(function (d) { 
            var date = d.Loct_Start.split(" ")[0].split("-");
            var day = new Date(date[1]+"-"+date[0]+"-"+date[2]);
            return parseInt(day.getDay());
        }),

        staypoints.hour = staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[1].split(":")[0]) }),
        staypoints.minute = staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[1].split(":")[1]) }),

        staypoints.academicDayStart = staypoints.dimension(function (d) { return d.Academic_Day_Start }),
        staypoints.academicDayEnd = staypoints.dimension(function (d) { return d.Academic_Day_End }),
        staypoints.duration = staypoints.dimension(function (d) { return d.Duration_minutes }),
        staypoints.buildingId = staypoints.dimension(function (d) { return d.Building_ID }),
        staypoints.buildingName = staypoints.dimension(function (d) { return d.Building_Name }),
        staypoints.latitude = staypoints.dimension(function (d) { return d.Lat }),
        staypoints.longitude = staypoints.dimension(function (d) { return d.Lon }),
        staypoints.maxTemp = staypoints.dimension(function (d) { return d.Max_Temp_C }),
        staypoints.meanTemp = staypoints.dimension(function (d) { return d.Mean_Temp_C }),
        staypoints.totalPrecip = staypoints.dimension(function (d) { return d.Total_Precip_mm }),
        staypoints.snow = staypoints.dimension(function (d) { return d.Snow_cm }),
        staypoints.qScore = staypoints.dimension(function (d) { return d.Q_Score }),
        staypoints.tScore = staypoints.dimension(function (d) { return d.T_Score }),
        staypoints.aScore = staypoints.dimension(function (d) { return d.A_Score }),
        staypoints.combinedScore = staypoints.dimension(function (d) { return d.Combined_Score }),
        staypoints.centroidLat = staypoints.dimension(function (d) { return d.Centroid_Lat }),
        staypoints.centroidLon = staypoints.dimension(function (d) { return d.Centroid_Lon }),
        staypoints.groupCentroidLat = staypoints.dimension(function (d) { return d.Group_Centroid_Lat }),
        staypoints.groupCentroidLon = staypoints.dimension(function (d) { return d.Group_Centroid_Lon })
    }
    catch (e) { console.log(e.stack); }
}

// #endregion

// #region Utilities

function findPointsWithinAPolygon(allPoints, polyPoints, path)
{
    var pointsWithinPoly;
    if (path) pointsWithinPoly = [];
    else pointsWithinPoly = {lons : [], lats : []};

    var points = turf.points(allPoints);
    var polygon = turf.polygon(polyPoints);
    var ptsWithin = turf.pointsWithinPolygon(points, polygon);
    
    for (var i = 0; i < ptsWithin.features.length; i++)
    {
        var lon = (ptsWithin.features[i].geometry.coordinates[0]);
        var lat = (ptsWithin.features[i].geometry.coordinates[1]);
        if (path) 
        {
            pointsWithinPoly.push(pathCoordinateIDs[[lon,lat]]);
        }
        else
        {
            pointsWithinPoly.lons.push(lon);
            pointsWithinPoly.lats.push(lat);
        }
    }
    return pointsWithinPoly;
}

function findPointsWithinAllPolygons(allPoints, path)
{
    var pointsWithinAllPoly = [];

    var n = 0;
    for (var id in allPolyPoints)
    {
        pointsWithinAllPoly[n] = findPointsWithinAPolygon(allPoints, allPolyPoints[id], path);
        n++;
    }

    return pointsWithinAllPoly;
}

// #endregion
