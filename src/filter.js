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

var filteredPathIDs = [];

const paths = crossfilter(pathsjson);
const maxPaths = paths.groupAll().reduceCount().value();

const staypoints = crossfilter(staypointsjson);
const maxStaypoints = staypoints.groupAll().reduceCount().value();

// const staypoints = crossfilter(staypointsjson);
configurePathsFilter();
configureStaypointsFilter();

// paths.id.filter([0,4]);
// paths.academicDay.filter('BETWEEN_TERMS');
// staypoints.academicDayStart.filter('BETWEEN_TERMS');

// #region Paths

function filterPathsPassingThroughPolygon()
{
    filteredPathIDs = [];
    paths.id.filter(null);
    
    var pathCoordinates = [];
    paths.allFiltered().forEach(function (d)
    {
        pathCoordinates.push([d.Lon, d.Lat]);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(pathCoordinates, true);

    // Set up dictionary where key: path ID, value: all points on path
    var pathID = paths.allFiltered()[0].Path_ID;
    var pointsForPath = {};
    pointsForPath[paths.allFiltered()[0].Path_ID] = [];
    paths.allFiltered().forEach(function (d)
    {
        if (d.Path_ID != pathID)
        {
            pathID = d.Path_ID;
            pointsForPath[pathID] = [];
        }
        pointsForPath[pathID].push("" + d.Lon + d.Lat);
    });

    // console.log(pointsForPath);
    // console.log(pointsWithinAllPoly);

    // Intersect all points on path with all points within each polygon, add to filter list if there exists a point in each polygon
    // NEEDS REFACTORING. SLOW ASF
    for (var id in pointsForPath) // per path
    {
        var add = true;
        for (var n in pointsWithinAllPoly) // per polygon
        {
            if (pointsWithinAllPoly[n].filter(x => pointsForPath[id].includes(x)).length == 0)
            {
                add = false;
                break;
            }
        }
        if (add)
            filteredPathIDs.push(parseInt(id));
    }
    // for (var id in pointsForPath) // per path
    // {
    //     var add = true;
    //     for (var n in pointsWithinAllPoly) // per polygon
    //     {
    //         var found = false;
    //         for (var p in pointsForPath[id]) // per point on path
    //         {
    //             if (pointsWithinAllPoly[n].some(a => pointsForPath[id][p].includes(a)))
    //             {
    //                 found = true;
    //                 break;
    //             }
    //         }
    //         if (!found)
    //         {
    //             add = false;
    //             break;
    //         }
    //     }
    //     if (add)
    //         filteredPathIDs.push(parseInt(id));
    // }

    // Filter
    if (filteredPathIDs.length > 0)
    {
        paths.id.filter(function (d)
        {
            return filteredPathIDs.indexOf(d) > -1;
        });
    }
    else
        alert("There are no paths going through these polygons.");
}

function configurePathsFilter()
{
    try 
    {
        paths.id = paths.dimension(function (d) { return d.Path_ID }),
        paths.pointId = paths.dimension(function (d) { return d.Path_Point_ID }),
        paths.date = paths.dimension(function (d) { return d.Loct }), // Needs to parse properly
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

function filterStaypointsWithinPolygon()
{
    filteredCentroidLon = [];
    filteredCentroidLat = [];
    staypoints.centroidLon.filter(null);
    staypoints.centroidLat.filter(null);

    var staypointCoordinates = [];
    var staypointLons = [];
    var staypointLats = [];
    staypoints.allFiltered().forEach(function (d)
    {
        staypointCoordinates.push([d.Centroid_Lon, d.Centroid_Lat]);
        staypointLons.push(d.Centroid_Lon);
        staypointLats.push(d.Centroid_Lat);
    });

    var pointsWithinAllPoly = findPointsWithinAllPolygons(staypointCoordinates);
    // console.log(pointsWithinAllPoly);

    // Intersect all staypoints with points within each polygon, add intersection to filter list
    for (var n in pointsWithinAllPoly)
    {
        var intersectLon = pointsWithinAllPoly[n].lons.filter(x => staypointLons.includes(x));
        var intersectLat = pointsWithinAllPoly[n].lats.filter(x => staypointLats.includes(x));

        filteredCentroidLon = filteredCentroidLon.concat(intersectLon);
        filteredCentroidLat = filteredCentroidLat.concat(intersectLat);
    }

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

function configureStaypointsFilter()
{
    try 
    {
        staypoints.loctStart = staypoints.dimension(function (d) { return d.Loct_Start }),
        staypoints.loctEnd = staypoints.dimension(function (d) { return d.Loct_End }),
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


function findPointsWithinAllPolygons(allPoints, path)
{
    var pointsWithinAllPoly = [];

    var n = 0;
    for (var id in allPolyPoints)
    {
        if (path) pointsWithinAllPoly[n] = [];
        else pointsWithinAllPoly[n] = {lats : [], lons : []};

        var points = turf.points(allPoints);
        var polygon = turf.polygon(allPolyPoints[id]);
        var ptsWithin = turf.pointsWithinPolygon(points, polygon);
        
        for (var i = 0; i < ptsWithin.features.length; i++)
        {
            var lon = (ptsWithin.features[i].geometry.coordinates[0]);
            var lat = (ptsWithin.features[i].geometry.coordinates[1]);
            if (path) pointsWithinAllPoly[n].push("" + lon + lat);
            else
            {
                pointsWithinAllPoly[n].lons.push(lon);
                pointsWithinAllPoly[n].lats.push(lat);
            }
        }
        n++;
    }

    return pointsWithinAllPoly;
}
