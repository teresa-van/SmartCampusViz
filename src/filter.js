/*
    Filters: 
        [lowerBound, upperBound] <- Select all values that range between lower and upper bound
        value <- Select value equal to value
        function(d) { return d } <- Select values equal to result of the function
        null <- Select all (remove filter)
*/

var pathsURL = "https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/paths.json";
var pathsjson;

// #region Load stuff

function loadJSON(callback)
{
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', pathsURL, false); // Replace 'my_data' with the path to your file
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
    // Parse JSON string into object
    pathsjson = JSON.parse(response);
});

// #endregion

var filteredLat = [];
var filteredLon = [];
var filteredPathIDs = [];

const paths = crossfilter(pathsjson);
const maxPaths = paths.groupAll().reduceCount().value();
// const staypoints = crossfilter(staypointsjson);
configurePathsFilter();
// filterPathID([0,4]);
// filterCoordinates((-114.1288, 51.07751));
filterPathAcademicDay('BETWEEN_TERMS');
// filterPathMaxTemp([0,8]);
// filterLatitude([51.077820, 51.078580]);
// filterLongitude([-114.13050, -114.12840]);

// #region Paths

function filterPathID(id)
{
    paths.id.filter(id);
}

function filterPathAcademicDay(academicDay)
{
    paths.academicDay.filter(academicDay);
}

function filterPathBuildingID(buildingId)
{
    paths.buildingId.filter(buildingId);
}

function filterPathBuildingName(buildingName)
{
    paths.buildingName.filter(buildingName);
}

function filterPathMaxTemp(maxTemp)
{
    paths.maxTemp.filter(maxTemp);
}

function filterPathMeanTemp(meanTemp)
{
    paths.meanTemp.filter(meanTemp);
}

// function filterCoordinates(coordinates)
// {
//     paths.coordinates.filter(coordinates);
// }

function filterLatitude(latitude)
{
    paths.latitude.filter(latitude);
}

function filterLongitude(longitude)
{
    paths.longitude.filter(longitude);
}

function filterPointsWithin(points)
{
    // for (var i = 0; i < points.features.length; i++)
    //     filteredCoord.push((points.features[i].geometry.coordinates[0], points.features[i].geometry.coordinates[1]));
    
    // filterCoordinates(function (d)
    // {
    //     return filteredCoord.indexOf(d) > -1;
    // });
    for (var i = 0; i < points.features.length; i++)
    {
        filteredLat.push(points.features[i].geometry.coordinates[1]);
        filteredLon.push(points.features[i].geometry.coordinates[0]);
    }
    
    // console.log(lats);
    // console.log(lons);

    filterLatitude(function(d)
    {
        return filteredLat.indexOf(d) > -1;
    });
    filterLongitude(function(d)
    {
        return filteredLon.indexOf(d) > -1;
    });
}

function filterPathsPassingThrough()
{
    var pointsWithinAllPoly = [];
    filteredPathIDs = [];
    filterPathID(null);

    var pathCoordinates = [];
    paths.allFiltered().forEach(function (d)
    {
        pathCoordinates.push([d.Lon, d.Lat]);
    });

    var n = 0;
    for (var id in allPolyPoints)
    {
        pointsWithinAllPoly[n] = {lats : [], lons : []};

        var points = turf.points(pathCoordinates);
        var polygon = turf.polygon(allPolyPoints[id]);
        var ptsWithin = turf.pointsWithinPolygon(points, polygon);
        
        for (var i = 0; i < ptsWithin.features.length; i++)
        {
            var lon = (ptsWithin.features[i].geometry.coordinates[0]);
            var lat = (ptsWithin.features[i].geometry.coordinates[1]);
            pointsWithinAllPoly[n].lons.push(lon);
            pointsWithinAllPoly[n].lats.push(lat);
        }
        n++;
    }

    var pathID = paths.allFiltered()[0].Path_ID;
    var pointsForPath = {};
    pointsForPath[paths.allFiltered()[0].Path_ID] = {lats:[], lons:[]};
    paths.allFiltered().forEach(function (d)
    {
        if (d.Path_ID != pathID)
        {
            pathID = d.Path_ID;
            pointsForPath[pathID] = {lats:[], lons:[]};
        }
        pointsForPath[pathID].lons.push(d.Lon);
        pointsForPath[pathID].lats.push(d.Lat);
    });
    
    for (var id in pointsForPath)
    {
        var add = true;
        for (var n in pointsWithinAllPoly)
        {
            if (pointsWithinAllPoly[n].lats.filter(x => pointsForPath[id].lats.includes(x)).length == 0 || 
                pointsWithinAllPoly[n].lons.filter(x => pointsForPath[id].lons.includes(x)).length == 0)
            {
                add = false;
            }
        }
        if (add)
            filteredPathIDs.push(parseInt(id));
    }


    if (filteredPathIDs.length > 0)
    {
        filterPathID(function (d)
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
        // paths.coordinates = paths.dimension(function (d) { return (d.Lon, d.Lat) })
    }
    catch (e) { console.log(e.stack); }
}

// #endregion
