function remove(array, element) 
{
    const index = array.indexOf(element);

    if (index !== -1) 
      array.splice(index, 1);
}

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

function calculateCentroid(points)
{
	var centroid = [0.0, 0.0];
	for (var p in points)
	{
		centroid[0] += points[p][0];
		centroid[1] += points[p][1];
	}

	centroid[0] /= points.length;
	centroid[1] /= points.length;

	return centroid;
}