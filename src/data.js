// import {Vector2} from 'math.gl';
// import {default as staypoints} from '../data/staypoints.json';
// import * as data from './filter'

const GEOJSON = 'https://raw.githubusercontent.com/teresa-van/SmartCampusViz/UNSTABLE/src/Campus_buildings_updated3.geojson';
const filteredNumPaths = paths.groupAll().reduceCount().value();
// const maxPaths = maxPaths;
var PATHSVISUAL = [];
var STAYPOINTSVISUAL = [];

const S = 0.75;
const B = 1;

// console.log(paths.allFiltered());

UpdatePaths();
// UpdateStaypoints();

// Parse paths data
// var color = HSVtoRGB(0, S, B);
// var color = HSVtoRGB(((paths[0].Azimuth_Path * hueFactor) % 255) / 255, S, B);
function UpdatePaths()
{
    var filteredPaths = paths.allFiltered();
    var id = filteredPaths[0].Path_ID;
    var index = 0;
    var hueFactor = 255 / 360;
    var numPoints = filteredNumPaths;

    // Holy shit this shit needs refactoring...
    var color = HSVtoRGB(((filteredPaths[0].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
    PATHSVISUAL = [{path: [], azimuthColor: [color.r, color.g, color.b]}];
    for (let i = 0; i < numPoints; i++)
    {
        // if (id != paths[i].Path_ID)
        // {
        //     id++;
        //     // color = HSVtoRGB(((id * hueFactor) % 255) / 255, S, B);
        //     var color = HSVtoRGB(((paths[i].Azimuth_Path * hueFactor)) / 255, S, B);
        //     PATHS[id] = {path: [], azimuthColor: [color.r, color.g, color.b]};
        // }

        if (id != filteredPaths[i].Path_ID)
        {
            index++;
            id = filteredPaths[i].Path_ID;
            color = HSVtoRGB(((filteredPaths[i].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
            PATHSVISUAL[index] = {path: [], azimuthColor: [color.r, color.g, color.b]};
        } 

        if (PATHSVISUAL[index].path.length == 2)
        {
            index++;
            if (id != filteredPaths[i].Path_ID)
            {
                id = filteredPaths[i].Path_ID;
                color = HSVtoRGB(((filteredPaths[i].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
                PATHSVISUAL[index] = {path: [], azimuthColor: [color.r, color.g, color.b]};
            } 
            else
            {
                color = HSVtoRGB(((filteredPaths[i-1].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
                PATHSVISUAL[index] = {path: [], azimuthColor: [color.r, color.g, color.b]};

                var lat = parseFloat(filteredPaths[i-1].Lat);
                var lon = parseFloat(filteredPaths[i-1].Lon);
                PATHSVISUAL[index].path.push(new Vector2(lon, lat));
            }
        }

        var lat = parseFloat(filteredPaths[i].Lat);
        var lon = parseFloat(filteredPaths[i].Lon);
        // PATHS[id].path.push(new Vector2(lon, lat));
        PATHSVISUAL[index].path.push(new Vector2(lon, lat));
    }
}

// function UpdateStaypoints()
// {
//     var color;
//     // Parse staypoints data
//     for (let i = 0; i < staypoints.length; i++)
//     {
//         color = HSVtoRGB((i % 255) / 255, S, B);
//         STAYPOINTSVISUAL[i] = {point: [], color: [color.r, color.g, color.b]};
        
//         var lat = parseFloat(staypoints[i].Centroid_Lat);
//         var lon = parseFloat(staypoints[i].Centroid_Lon);
//         STAYPOINTSVISUAL[i].point.push(lon);
//         STAYPOINTSVISUAL[i].point.push(lat);
//     }
// }

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

// const PATHS =
// [
//     {
//         path:
//         [
//             new Vector2(-114.1288, 51.07751),
//             new Vector2(-114.129, 51.07729),
//             new Vector2(-114.1286, 51.07768),
//             new Vector2(-114.1271, 51.07653),
//             new Vector2(-114.1267, 51.07558),
//             new Vector2(-114.1243, 51.07624)
//         ]
//     },
//     {
//         path:
//         [
//             new Vector2(-114.132, 51.07831),
//             new Vector2(-114.1324, 51.07826),
//             new Vector2(-114.132, 51.07829),
//             new Vector2(-114.131, 51.07852),
//             new Vector2(-114.1295, 51.07989),
//             new Vector2(-114.1282, 51.07971)
//         ]
//     },
//     {
//         path:
//         [
//             new Vector2(-114.1257, 51.07992),
//             new Vector2(-114.1261, 51.07955),
//             new Vector2(-114.1264, 51.07947),
//             new Vector2(-114.1284, 51.07885),
//             new Vector2(-114.1286, 51.07902),
//             new Vector2(-114.1283, 51.0802)
//         ]
//     }
// ];