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

const paths = crossfilter(pathsjson);
const maxPaths = paths.groupAll().reduceCount().value();
// const staypoints = crossfilter(staypointsjson);
configurePathsFilter();
// filterPathAcademicDay('BETWEEN_TERMS');
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

function filterLatitude(latitude)
{
    paths.latitude.filter(latitude);
}

function filterLongitude(longitude)
{
    paths.longitude.filter(longitude);
}

function filteredPointsWithin(points)
{
    var lats = []
    var lons = [];
    for (var i = 0; i < points.features.length; i++)
    {
        lons.push(points.features[i].geometry.coordinates[0]);
        lats.push(points.features[i].geometry.coordinates[1]);
    }
    
    // console.log(lats);
    // console.log(lons);

    paths.latitude.filter(function(d)
    {
        return lats.indexOf(d) > -1;
    });
    paths.longitude.filter(function(d)
    {
        return lons.indexOf(d) > -1;
    });
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
