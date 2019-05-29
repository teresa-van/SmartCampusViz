/*
    Filters: 
        [lowerBound, upperBound] <- Select all values that range between lower and upper bound
        value <- Select value equal to value
        function(d) { return d } <- Select values equal to result of the function
        null <- Select all (remove filter)
*/

var pathsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/animate/data/paths.json";
var pathsjson;

var staypointsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/staypoints.json";
var staypointsjson;

// #region Load stuff
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
var filteredPathIDs = [[], []];
var pathCoordinateIDs = [{}, {}];
const paths = [crossfilter(pathsjson), crossfilter(pathsjson)];
const maxPaths = paths[0].groupAll().reduceCount().value();

// Staypoint variables
filteredCentroidLon = [[], []];
filteredCentroidLat = [[], []];
const staypoints = [crossfilter(staypointsjson), crossfilter(staypointsjson)];
const maxStaypoints = staypoints[0].groupAll().reduceCount().value();

configurePathsFilter(paths[0]);
configurePathsFilter(paths[1]);

configureStaypointsFilter(staypoints[0]);
configureStaypointsFilter(staypoints[1]);

// paths.month.filter(6);
// paths.weekday.filter(0);
// paths.id.filter(2656);
// paths.academicDay.filter('BETWEEN_TERMS');
// staypoints.academicDayStart.filter('BETWEEN_TERMS');

// #region Paths

function filterPathsPassingThroughPolygons(index)
{
    // Filter
    if (filteredPathIDs[index].length > 0)
    {
        paths[index].id.filter(function (d)
        {
            return filteredPathIDs[index].indexOf(d) > -1;
        });
    }
}

function findPathsPassingThroughPolygon(index)
{
    pathCoordinateIDs[index] = {};
    var pathCoordinates = [];

    paths[index].allFiltered().forEach(function (d)
    {
        pathCoordinateIDs[index][[d.Lon, d.Lat]] = d.Path_ID;
        pathCoordinates.push([d.Lon, d.Lat]);
    });

    var pointsWithinPoly = findPointsWithinAPolygon(pathCoordinates, allPolyPoints[index][Object.keys(allPolyPoints[index])[Object.keys(allPolyPoints[index]).length-1]], true, index);
    if (Object.keys(allPolyPoints[index]).length == 1) filteredPathIDs[index] = pointsWithinPoly;
    else filteredPathIDs[index] = filteredPathIDs[index].filter(x => pointsWithinPoly.includes(x))   

    // Filter
    filterPathsPassingThroughPolygons(index);
}

function findPathsPassingThroughAllPolygons(index)
{
    pathCoordinateIDs[index] = {};
    var pathCoordinates = [];

    paths[index].id.filter(null);
    
    paths[index].allFiltered().forEach(function (d)
    {
        pathCoordinateIDs[index][[d.Lon, d.Lat]] = d.Path_ID;
        pathCoordinates.push([d.Lon, d.Lat]);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(pathCoordinates, true, index);

    if (Object.keys(allPolyPoints[index]).length == 0) filteredPathIDs[index] = [];
    else filteredPathIDs[index] = pointsWithinAllPoly[0];

    // Intersect all points on path with all points within each polygon, add to filter list if there exists a point in each polygon
    for (var p in pointsWithinAllPoly)
        filteredPathIDs[index] = filteredPathIDs[index].filter(x => pointsWithinAllPoly[p].includes(x))   

    // Filter
    filterPathsPassingThroughPolygons(index);
}

var month

function configurePathsFilter(_paths)
{
    try 
    {
        _paths.id = _paths.dimension(function (d) { return d.Path_ID }),
        _paths.pointId = _paths.dimension(function (d) { return d.Path_Point_ID }),
        _paths.date = _paths.dimension(function (d) { return d.Loct }), // Needs to parse properly

        _paths.day = _paths.dimension(function (d) { return d.Day }),
        _paths.month = _paths.dimension(function (d) { return d.Month }),
        _paths.year = _paths.dimension(function (d) { return d.Year }),
        _paths.weekday = _paths.dimension(function (d) { return d.Weekday }),

        _paths.hour = _paths.dimension(function (d) { return d.Time_Hour }),
        _paths.minute = _paths.dimension(function (d) { return d.Time_Min }),
        _paths.seconds = _paths.dimension(function (d) { return d.Time_Sec }),

        _paths.academicDay = _paths.dimension(function (d) { return d.Academic_Day }),
        _paths.buildingId = _paths.dimension(function (d) { return d.Building_ID }),
        _paths.buildingName = _paths.dimension(function (d) { return d.Building_Name }),
        _paths.latitude = _paths.dimension(function (d) { return d.Lat }),
        _paths.longitude = _paths.dimension(function (d) { return d.Lon }),
        _paths.distanceToNext = _paths.dimension(function (d) { return d.Distance_To_Next }),
        _paths.minutesToNext = _paths.dimension(function (d) { return d.Minutes_To_Next }),
        _paths.maxTemp = _paths.dimension(function (d) { return d.Max_Temp_C }),
        _paths.meanTemp = _paths.dimension(function (d) { return d.Mean_Temp_C }),
        _paths.totalPrecip = _paths.dimension(function (d) { return d.Total_Precip_mm }),
        _paths.snow = _paths.dimension(function (d) { return d.Snow_cm }),
        _paths.azimuthPath = _paths.dimension(function (d) { return d.Azimuth_Path }),
        _paths.azimuthSegment = _paths.dimension(function (d) { return d.Azimuth_Segment }),
        _paths.speed = _paths.dimension(function (d) { return d.Speed });
    }
    catch (e) { console.log(e.stack); }
}

// #endregion

// #region Staypoints

function filterStaypointsWithinPolygons(index)
{
    // Filter
    if (filteredCentroidLon[index].length > 0)
    {
        staypoints[index].centroidLon.filter(function (d)
        {
            return filteredCentroidLon[index].indexOf(d) > -1;
        });
    }
    if (filteredCentroidLat[index].length > 0)
    {
        staypoints[index].centroidLat.filter(function (d)
        {
            return filteredCentroidLat[index].indexOf(d) > -1;
        });
    }
}

function findStaypointsWithinPolygon(index)
{
    staypoints[index].centroidLon.filter(null);
    staypoints[index].centroidLat.filter(null);

    var staypointCoordinates = [];
    staypoints[index].allFiltered().forEach(function (d)
    {
        staypointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
    });

    var pointsWithinPoly = findPointsWithinAPolygon(staypointCoordinates, allPolyPoints[index][Object.keys(allPolyPoints[index])[Object.keys(allPolyPoints[index]).length-1]], false, index);
    filteredCentroidLon[index] = filteredCentroidLon[index].concat(pointsWithinPoly.lons);
    filteredCentroidLat[index] = filteredCentroidLat[index].concat(pointsWithinPoly.lats);

    // Filter
    filterStaypointsWithinPolygons(index);
}

function findStaypointsWithinAllPolygons(index)
{
    filteredCentroidLon[index] = [];
    filteredCentroidLat[index] = [];

    staypoints[index].centroidLon.filter(null);
    staypoints[index].centroidLat.filter(null);

    var staypointCoordinates = [];
    staypoints[index].allFiltered().forEach(function (d)
    {
        staypointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(staypointCoordinates, false, index);

    for (var p in pointsWithinAllPoly)
    {
        filteredCentroidLon[index] = filteredCentroidLon[index].concat(pointsWithinAllPoly[p].lons);
        filteredCentroidLat[index] = filteredCentroidLa[index].concat(pointsWithinAllPoly[p].lats);
    }

    // Filter
    filterStaypointsWithinPolygons(index);
}

function configureStaypointsFilter(_staypoints)
{
    try 
    {
        _staypoints.loctStart = _staypoints.dimension(function (d) { return d.Loct_Start }),
        _staypoints.loctEnd = _staypoints.dimension(function (d) { return d.Loct_End }),

        _staypoints.day = _staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[0]) }),
        _staypoints.month = _staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[1]) }),
        _staypoints.year = _staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[2]) }),
        _staypoints.weekday = _staypoints.dimension(function (d) { 
            var date = d.Loct_Start.split(" ")[0].split("-");
            var day = new Date(date[1]+"-"+date[0]+"-"+date[2]);
            return parseInt(day.getDay());
        }),

        _staypoints.hour = _staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[1].split(":")[0]) }),
        _staypoints.minute = _staypoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[1].split(":")[1]) }),

        _staypoints.academicDayStart = _staypoints.dimension(function (d) { return d.Academic_Day_Start }),
        _staypoints.academicDayEnd = _staypoints.dimension(function (d) { return d.Academic_Day_End }),
        _staypoints.duration = _staypoints.dimension(function (d) { return d.Duration_minutes }),
        _staypoints.buildingId = _staypoints.dimension(function (d) { return d.Building_ID }),
        _staypoints.buildingName = _staypoints.dimension(function (d) { return d.Building_Name }),
        _staypoints.latitude = _staypoints.dimension(function (d) { return d.Lat }),
        _staypoints.longitude = _staypoints.dimension(function (d) { return d.Lon }),
        _staypoints.maxTemp = _staypoints.dimension(function (d) { return d.Max_Temp_C }),
        _staypoints.meanTemp = _staypoints.dimension(function (d) { return d.Mean_Temp_C }),
        _staypoints.totalPrecip = _staypoints.dimension(function (d) { return d.Total_Precip_mm }),
        _staypoints.snow = _staypoints.dimension(function (d) { return d.Snow_cm }),
        _staypoints.qScore = _staypoints.dimension(function (d) { return d.Q_Score }),
        _staypoints.tScore = _staypoints.dimension(function (d) { return d.T_Score }),
        _staypoints.aScore = _staypoints.dimension(function (d) { return d.A_Score }),
        _staypoints.combinedScore = _staypoints.dimension(function (d) { return d.Combined_Score }),
        _staypoints.centroidLat = _staypoints.dimension(function (d) { return d.Centroid_Lat }),
        _staypoints.centroidLon = _staypoints.dimension(function (d) { return d.Centroid_Lon }),
        _staypoints.groupCentroidLat = _staypoints.dimension(function (d) { return d.Group_Centroid_Lat }),
        _staypoints.groupCentroidLon = _staypoints.dimension(function (d) { return d.Group_Centroid_Lon })
    }
    catch (e) { console.log(e.stack); }
}

// #endregion

// #region Utilities

function findPointsWithinAPolygon(allPoints, polyPoints, path, index)
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
            var id = pathCoordinateIDs[index][[lon,lat]];
            if (!pointsWithinPoly.includes(id)) pointsWithinPoly.push(id);
        }
        else
        {
            if (!pointsWithinPoly.lons.includes(lon)) pointsWithinPoly.lons.push(lon);
            if (!pointsWithinPoly.lats.includes(lat)) pointsWithinPoly.lats.push(lat);
        }
    }
    return pointsWithinPoly;
}

function findPointsWithinAllPolygons(allPoints, path, index)
{
    var pointsWithinAllPoly = [];

    var n = 0;
    for (var id in allPolyPoints[index])
    {
        pointsWithinAllPoly[n] = findPointsWithinAPolygon(allPoints, allPolyPoints[index][id], path, index);
        n++;
    }

    return pointsWithinAllPoly;
}

// #endregion
