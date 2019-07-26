/*
    Filters: 
        [lowerBound, upperBound] <- Select all values that range between lower and upper bound
        value <- Select value equal to value
        function(d) { return d } <- Select values equal to result of the function
        null <- Select all (remove filter)
*/

var pathsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/paths.json";
var pathsjson;

var restpointsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/staypoints.json";
var restpointsjson;

// #region Load stuff
loadJSON(function (response)
{
    pathsjson = JSON.parse(response);
}, pathsURL);

loadJSON(function (response)
{
    restpointsjson = JSON.parse(response);
}, restpointsURL);

// #endregion

// Paths variables
var filteredPathIDs = [[], []];
var pathCoordinateIDs = [{}, {}];
const paths = [crossfilter(pathsjson), crossfilter(pathsjson)];
const maxPaths = paths[0].groupAll().reduceCount().value();

// Restpoint variables
filteredCentroidLon = [[], []];
filteredCentroidLat = [[], []];
const restpoints = [crossfilter(restpointsjson), crossfilter(restpointsjson)];
const maxRestpoints = restpoints[0].groupAll().reduceCount().value();

configurePathsFilter(paths[0]);
configurePathsFilter(paths[1]);

configureRestpointsFilter(restpoints[0]);
configureRestpointsFilter(restpoints[1]);

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

        _paths.day = _paths.dimension(function (d) { return d.Loct_Day }),
        _paths.month = _paths.dimension(function (d) { return d.Loct_Month }),
        _paths.year = _paths.dimension(function (d) { return d.Loct_Year }),
        _paths.weekday = _paths.dimension(function (d) { return d.Weekday }),

        _paths.hour = _paths.dimension(function (d) { return d.Loct_Hour }),
        _paths.minute = _paths.dimension(function (d) { return d.Loct_Minute }),
        _paths.second = _paths.dimension(function (d) { return d.Loct_Second }),

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

// #region Restpoints

function filterRestpointsWithinPolygons(index)
{
    // Filter
    if (filteredCentroidLon[index].length > 0)
    {
        restpoints[index].centroidLon.filter(function (d)
        {
            return filteredCentroidLon[index].indexOf(d) > -1;
        });
    }
    if (filteredCentroidLat[index].length > 0)
    {
        restpoints[index].centroidLat.filter(function (d)
        {
            return filteredCentroidLat[index].indexOf(d) > -1;
        });
    }
}

function findRestpointsWithinPolygon(index)
{
    restpoints[index].centroidLon.filter(null);
    restpoints[index].centroidLat.filter(null);

    var restpointCoordinates = [];
    restpoints[index].allFiltered().forEach(function (d)
    {
        restpointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
    });

    var pointsWithinPoly = findPointsWithinAPolygon(restpointCoordinates, allPolyPoints[index][Object.keys(allPolyPoints[index])[Object.keys(allPolyPoints[index]).length-1]], false, index);
    filteredCentroidLon[index] = filteredCentroidLon[index].concat(pointsWithinPoly.lons);
    filteredCentroidLat[index] = filteredCentroidLat[index].concat(pointsWithinPoly.lats);

    // Filter
    filterRestpointsWithinPolygons(index);
}

function findRestpointsWithinAllPolygons(index)
{
    filteredCentroidLon[index] = [];
    filteredCentroidLat[index] = [];

    restpoints[index].centroidLon.filter(null);
    restpoints[index].centroidLat.filter(null);

    var restpointCoordinates = [];
    restpoints[index].allFiltered().forEach(function (d)
    {
        restpointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(restpointCoordinates, false, index);

    for (var p in pointsWithinAllPoly)
    {
        filteredCentroidLon[index] = filteredCentroidLon[index].concat(pointsWithinAllPoly[p].lons);
        filteredCentroidLat[index] = filteredCentroidLa[index].concat(pointsWithinAllPoly[p].lats);
    }

    // Filter
    filterRestpointsWithinPolygons(index);
}

function configureRestpointsFilter(_restpoints)
{
    try 
    {
        _restpoints.loctStart = _restpoints.dimension(function (d) { return d.Loct_Start }),
        _restpoints.loctEnd = _restpoints.dimension(function (d) { return d.Loct_End }),

        _restpoints.day = _restpoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[0]) }),
        _restpoints.month = _restpoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[1]) }),
        _restpoints.year = _restpoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[0].split("-")[2]) }),
        _restpoints.weekday = _restpoints.dimension(function (d) { 
            var date = d.Loct_Start.split(" ")[0].split("-");
            var day = new Date(date[1]+"-"+date[0]+"-"+date[2]);
            return parseInt(day.getDay());
        }),

        _restpoints.hour = _restpoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[1].split(":")[0]) }),
        _restpoints.minute = _restpoints.dimension(function (d) { return parseInt(d.Loct_Start.split(" ")[1].split(":")[1]) }),

        _restpoints.academicDayStart = _restpoints.dimension(function (d) { return d.Academic_Day_Start }),
        _restpoints.academicDayEnd = _restpoints.dimension(function (d) { return d.Academic_Day_End }),
        _restpoints.duration = _restpoints.dimension(function (d) { return d.Duration_minutes }),
        _restpoints.buildingId = _restpoints.dimension(function (d) { return d.Building_ID }),
        _restpoints.buildingName = _restpoints.dimension(function (d) { return d.Building_Name }),
        _restpoints.latitude = _restpoints.dimension(function (d) { return d.Lat }),
        _restpoints.longitude = _restpoints.dimension(function (d) { return d.Lon }),
        _restpoints.maxTemp = _restpoints.dimension(function (d) { return d.Max_Temp_C }),
        _restpoints.meanTemp = _restpoints.dimension(function (d) { return d.Mean_Temp_C }),
        _restpoints.totalPrecip = _restpoints.dimension(function (d) { return d.Total_Precip_mm }),
        _restpoints.snow = _restpoints.dimension(function (d) { return d.Snow_cm }),
        _restpoints.qScore = _restpoints.dimension(function (d) { return d.Q_Score }),
        _restpoints.tScore = _restpoints.dimension(function (d) { return d.T_Score }),
        _restpoints.aScore = _restpoints.dimension(function (d) { return d.A_Score }),
        _restpoints.combinedScore = _restpoints.dimension(function (d) { return d.Combined_Score }),
        _restpoints.centroidLat = _restpoints.dimension(function (d) { return d.Centroid_Lat }),
        _restpoints.centroidLon = _restpoints.dimension(function (d) { return d.Centroid_Lon }),
        _restpoints.groupCentroidLat = _restpoints.dimension(function (d) { return d.Group_Centroid_Lat }),
        _restpoints.groupCentroidLon = _restpoints.dimension(function (d) { return d.Group_Centroid_Lon })
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