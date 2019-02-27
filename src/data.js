import {Vector2} from 'math.gl';
import {default as pathjson} from './paths.json';

export const GEOJSON = 'Campus_buildings_updated3.geojson';

const S = 0.75;
const B = 0.95;

var color = HSVtoRGB(0, S, B);
export const PATHS = [{path: [], color: [color.r, color.g, color.b]}];
var id = 0;
for (let i = 0; i < pathjson.length; i++)
{
  if (id != pathjson[i].Path_ID)
  {
    id++;
    color = HSVtoRGB((id  % 255) / 255, S, B);
    PATHS[id] = {path: [], color: [color.r, color.g, color.b]};
  }

  PATHS[id].path.push(new Vector2(pathjson[i].Lon, pathjson[i].Lat));
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
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