import {Vector2} from 'math.gl';
import {default as pathjson} from '../data/paths.json';
import {default as staypointsjson} from '../data/staypoints.json';

export const GEOJSON = 'Campus_buildings_updated3.geojson';
// export const maxPaths = pathjson[pathjson.length-1].Path_ID;
export const maxPaths = pathjson.length;

const S = 0.75;
const B = 1;

// Parse paths data
// var color = HSVtoRGB(0, S, B);
// var color = HSVtoRGB(((pathjson[0].Azimuth_Path * hueFactor) % 255) / 255, S, B);
var color = HSVtoRGB(((pathjson[0].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
export const PATHS = [{path: [], azimuthColor: [color.r, color.g, color.b]}];
var id = 0;
var index = 0;
var hueFactor = 255 / 360;
var numPoints = 1000;//pathjson.length;
for (let i = 0; i < numPoints; i++)
{
    // if (id != pathjson[i].Path_ID)
    // {
    //     id++;
    //     // color = HSVtoRGB(((id * hueFactor) % 255) / 255, S, B);
    //     var color = HSVtoRGB(((pathjson[i].Azimuth_Path * hueFactor)) / 255, S, B);
    //     PATHS[id] = {path: [], azimuthColor: [color.r, color.g, color.b]};
    // }

    if (PATHS[index].path.length == 2)
    {
        index++;
        if (id != pathjson[i].Path_ID)
        {
            id++;
            color = HSVtoRGB(((pathjson[i].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
            PATHS[index] = {path: [], azimuthColor: [color.r, color.g, color.b]};
        }
        else
        {
            color = HSVtoRGB(((pathjson[i-1].Azimuth_Segment * hueFactor) % 255) / 255, S, B);
            PATHS[index] = {path: [], azimuthColor: [color.r, color.g, color.b]};

            var lat = parseFloat(pathjson[i-1].Lat);
            var lon = parseFloat(pathjson[i-1].Lon);
            PATHS[index].path.push(new Vector2(lon, lat));
        }
    }

    var lat = parseFloat(pathjson[i].Lat);
    var lon = parseFloat(pathjson[i].Lon);
    // PATHS[id].path.push(new Vector2(lon, lat));
    PATHS[index].path.push(new Vector2(lon, lat));
}

// Parse staypoints data
export const STAYPOINTS = [];
for (let i = 0; i < staypointsjson.length; i++)
{
    color = HSVtoRGB((i % 255) / 255, S, B);
    STAYPOINTS[i] = {point: [], color: [color.r, color.g, color.b]};
    
    var lat = parseFloat(staypointsjson[i].Centroid_Lat);
    var lon = parseFloat(staypointsjson[i].Centroid_Lon);
    STAYPOINTS[i].point.push(lon);
    STAYPOINTS[i].point.push(lat);
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