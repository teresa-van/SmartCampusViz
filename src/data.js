const GEOJSON = 'https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/data/Campus_buildings_updated3.geojson';

// var pathCoordinates = [];
var ANIMATEPATHS = [];
var PATHSVISUAL = [[], []];
var STAYPOINTSVISUAL = [[], []];

const S = 0.75;
const B = 1;

var pathStartDate = [0, 0];
var pathEndDate = [0, 0];

var staypointStartDate = [0, 0];
var staypointEndDate = [0, 0];

// Parse paths data
function updatePaths(index)
{
    // pathCoordinates = [];
    var filteredNumPaths = paths[index].groupAll().reduceCount().value();
    var filteredPaths = paths[index].allFiltered();

    pathStartDate = [0, 0];
    pathEndDate = [0, 0];
    
    staypointStartDate = [0, 0];
    staypointEndDate = [0, 0];

    var count = 0;
    var hueFactor = 255 / 360;

    if (filteredNumPaths == 0) return;
    
    // Holy shit this shit needs refactoring...
    var id = filteredPaths[0].Path_ID;
    var color = HSVtoRGB(((filteredPaths[0].Azimuth_Path * hueFactor) % 255) / 255, S, B);
    // var color = (filteredPaths[0].Mean_Temp_C > 0) ? HSVtoRGB(0, S, B) : HSVtoRGB(0.55, S, B);
    var timestamp = 0;
    PATHSVISUAL[index] = [{path: [], azimuthColor: [color.r, color.g, color.b]}];
    ANIMATEPATHS = [{path: [], azimuthColor: [color.r, color.g, color.b]}];
    for (let i = 0; i < filteredNumPaths; i++)
    {
        
        if (id != filteredPaths[i].Path_ID)
        {
            count++;
            id = filteredPaths[i].Path_ID;
            color = HSVtoRGB(((filteredPaths[i].Azimuth_Path * hueFactor) % 255) / 255, S, B);
            // color = (filteredPaths[i].Mean_Temp_C > 0) ? HSVtoRGB(0, S, B) : HSVtoRGB(0.55, S, B);
            timestamp = 0;
            PATHSVISUAL[index][count] = {path: [], azimuthColor: [color.r, color.g, color.b]};
            ANIMATEPATHS[count] = {path: [], azimuthColor: [color.r, color.g, color.b]};
        } 

        // if (PATHSVISUAL[index][count].path.length == 2)
        // {
        //     count++;
            
        //     color = HSVtoRGB(((filteredPaths[i-1].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
        //     PATHSVISUAL[index][count] = {path: [], azimuthColor: [color.r, color.g, color.b]};

        //     var lat = parseFloat(filteredPaths[i-1].Lat);
        //     var lon = parseFloat(filteredPaths[i-1].Lon);
        //     PATHSVISUAL[index][count].path.push([lon, lat]);
        // }

        var lat = parseFloat(filteredPaths[i].Lat);
        var lon = parseFloat(filteredPaths[i].Lon);

        var minFromLast = filteredPaths[i].Minutes_From_Last;
        timestamp = timestamp + (minFromLast * 100);

        var date = new Date(filteredPaths[i].Loct_Year, filteredPaths[i].Loct_Month, filteredPaths[i].Loct_Day).getTime();
        pathStartDate[index] = date < pathStartDate[index] || pathStartDate[index] == 0 ? date : pathStartDate[index];
        pathEndDate[index] = date > pathEndDate[index] || pathEndDate[index] == 0 ? date : pathEndDate[index];

        PATHSVISUAL[index][count].path.push([lon, lat]);
        ANIMATEPATHS[count].path.push([lon, lat, timestamp]);
    }
}

function updateStaypoints(index)
{
    var filteredNumStaypoints = staypoints[index].groupAll().reduceCount().value();
    var filteredStaypoints = staypoints[index].allFiltered();

    if (filteredNumStaypoints == 0) return;

    var color;
    STAYPOINTSVISUAL[index] = [];
    // Parse staypoints data
    for (let i = 0; i < filteredNumStaypoints; i++)
    {
        var hour = parseInt(filteredStaypoints[i].Loct_Start.split(" ")[1].split(":")[0]);
        var hue = (hour >= 0 && hour < 8) ? 0 : (hour >= 8 && hour < 16) ? 60 : 240
        color = HSVtoRGB(hue / 360, S, B);

        var s = (filteredStaypoints[i].Duration_minutes / 762.8) * 2000 + 2;
        STAYPOINTSVISUAL[index][i] = {point: [], color: [color.r, color.g, color.b], pointSize: s};
        
        var lat = parseFloat(filteredStaypoints[i].Centroid_Lat);
        var lon = parseFloat(filteredStaypoints[i].Centroid_Lon);

        var date = new Date(parseInt(filteredStaypoints[i].Loct_Start.split(" ")[0].split("-")[2]), 
                            parseInt(filteredStaypoints[i].Loct_Start.split(" ")[0].split("-")[1]), 
                            parseInt(filteredStaypoints[i].Loct_Start.split(" ")[0].split("-")[0])).getTime();
        staypointStartDate[index] = date < staypointStartDate[index] || staypointStartDate[index] == 0 ? date : staypointStartDate[index];
        staypointEndDate[index] = date > staypointEndDate[index] || staypointEndDate[index] == 0 ? date : staypointEndDate[index];

        STAYPOINTSVISUAL[index][i].point.push(lon);
        STAYPOINTSVISUAL[index][i].point.push(lat);
    }
}

// Converts HSV/HSB colour value to RGB
// Taken from: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
// h: hue, s: saturation, v: vibrance/brightness
function HSVtoRGB(h, s, v) 
{
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1)
        s = h.s, v = h.v, h = h.h;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) 
    {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}