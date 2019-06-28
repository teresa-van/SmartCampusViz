var width = 0.16 * window.innerWidth;

var leftCharts = 
[
    /////////////////// PATHS CHARTS ////////////////////////

    barChart()
        .dimension(paths[0].month)
        .group(paths[0].month.group())
        .x(d3.scale.linear()
            .domain([1,13])
            .rangeRound([0, width]))
        .tickLabels(["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
        .numTicks(13),

    barChart()
        .dimension(paths[0].weekday)
        .group(paths[0].weekday.group())
        .x(d3.scale.linear()
        .domain([0, 7])
        .rangeRound([0, width]))
        .tickLabels(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        .numTicks(8),

    barChart()
        .dimension(paths[0].hour)
        .group(paths[0].hour.group())
        .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, width]))
        .tickLabels([...Array(25).keys()])
        .numTicks(13),

        barChart()
        .dimension(paths[0].meanTemp)
        .group(paths[0].meanTemp.group())
        .x(d3.scale.linear()
        .domain([-25, 25])
        .rangeRound([0, width]))
        .tickLabels(["0", "0", "25"])
        .numTicks(1),

    barChart()
        .dimension(paths[0].totalPrecip)
        .group(paths[0].totalPrecip.group())
        .x(d3.scale.linear()
        .domain([0, 10])
        .rangeRound([0, width]))
        .tickLabels([...Array(10).keys()])
        .numTicks(9),

    barChart()
        .dimension(paths[0].snow)
        .group(paths[0].snow.group())
        .x(d3.scale.linear()
        .domain([0, 20])
        .rangeRound([0, width]))
        .tickLabels([...Array(20).keys()])
        .numTicks(9),

    barChart()
        .dimension(paths[0].azimuthPath)
        .group(paths[0].azimuthPath.group())
        .x(d3.scale.linear()
        .domain([0, 370])
        .rangeRound([0, width]))
        .tickLabels([...Array(370).keys()])
        .numTicks(9),


    /////////////////// STAYPOINTS CHARTS ////////////////////////

    barChart()
        .dimension(staypoints[0].month)
        .group(staypoints[0].month.group())
        .x(d3.scale.linear()
            .domain([1,13])
            .rangeRound([0, width]))
        .tickLabels(["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
        .numTicks(13),

    barChart()
        .dimension(staypoints[0].weekday)
        .group(staypoints[0].weekday.group())
        .x(d3.scale.linear()
        .domain([0, 7])
        .rangeRound([0, width]))
        .tickLabels(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        .numTicks(8),

    barChart()
        .dimension(staypoints[0].hour)
        .group(staypoints[0].hour.group())
        .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, width]))
        .tickLabels([...Array(25).keys()])
        .numTicks(13),

        barChart()
        .dimension(staypoints[0].meanTemp)
        .group(staypoints[0].meanTemp.group())
        .x(d3.scale.linear()
        .domain([-25, 25])
        .rangeRound([0, width]))
        .tickLabels(["0", "0", "25"])
        .numTicks(1),

    barChart()
        .dimension(staypoints[0].totalPrecip)
        .group(staypoints[0].totalPrecip.group())
        .x(d3.scale.linear()
        .domain([0, 10])
        .rangeRound([0, width]))
        .tickLabels([...Array(10).keys()])
        .numTicks(9),

    barChart()
        .dimension(staypoints[0].snow)
        .group(staypoints[0].snow.group())
        .x(d3.scale.linear()
        .domain([0, 20])
        .rangeRound([0, width]))
        .tickLabels([...Array(20).keys()])
        .numTicks(9),

    barChart()
        .dimension(staypoints[0].duration)
        .group(staypoints[0].duration.group())
        .x(d3.scale.linear()
        .domain([0, 1600])
        .rangeRound([0, width]))
        .tickLabels([...Array(1600).keys()])
        .numTicks(9),
];

var rightCharts = 
[
    /////////////////// PATHS CHARTS ////////////////////////

    barChart()
        .dimension(paths[1].month)
        .group(paths[1].month.group())
        .x(d3.scale.linear()
            .domain([1,13])
            .rangeRound([0, width]))
        .tickLabels(["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
        .numTicks(13),

    barChart()
        .dimension(paths[1].weekday)
        .group(paths[1].weekday.group())
        .x(d3.scale.linear()
        .domain([0, 7])
        .rangeRound([0, width]))
        .tickLabels(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        .numTicks(8),

    barChart()
        .dimension(paths[1].hour)
        .group(paths[1].hour.group())
        .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, width]))
        .tickLabels([...Array(25).keys()])
        .numTicks(13),

    barChart()
        .dimension(paths[1].meanTemp)
        .group(paths[1].meanTemp.group())
        .x(d3.scale.linear()
        .domain([-25, 25])
        .rangeRound([0, width]))
        .tickLabels(["0", "0", "25"])
        .numTicks(1),

    barChart()
        .dimension(paths[1].totalPrecip)
        .group(paths[1].totalPrecip.group())
        .x(d3.scale.linear()
        .domain([0, 10])
        .rangeRound([0, width]))
        .tickLabels([...Array(10).keys()])
        .numTicks(9),

    barChart()
        .dimension(paths[1].snow)
        .group(paths[1].snow.group())
        .x(d3.scale.linear()
        .domain([0, 20])
        .rangeRound([0, width]))
        .tickLabels([...Array(20).keys()])
        .numTicks(9),

    barChart()
        .dimension(paths[1].azimuthPath)
        .group(paths[1].azimuthPath.group())
        .x(d3.scale.linear()
        .domain([0, 370])
        .rangeRound([0, width]))
        .tickLabels([...Array(370).keys()])
        .numTicks(9),


    /////////////////// PATHS CHARTS ////////////////////////

    barChart()
        .dimension(staypoints[1].month)
        .group(staypoints[1].month.group())
        .x(d3.scale.linear()
            .domain([1,13])
            .rangeRound([0, width]))
        .tickLabels(["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
        .numTicks(13),

    barChart()
        .dimension(staypoints[1].weekday)
        .group(staypoints[1].weekday.group())
        .x(d3.scale.linear()
        .domain([0, 7])
        .rangeRound([0, width]))
        .tickLabels(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        .numTicks(8),

    barChart()
        .dimension(staypoints[1].hour)
        .group(staypoints[1].hour.group())
        .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, width]))
        .tickLabels([...Array(25).keys()])
        .numTicks(13),

    barChart()
        .dimension(staypoints[1].meanTemp)
        .group(staypoints[1].meanTemp.group())
        .x(d3.scale.linear()
        .domain([-25, 25])
        .rangeRound([0, width]))
        .tickLabels(["0", "0", "25"])
        .numTicks(1),

    barChart()
        .dimension(staypoints[1].totalPrecip)
        .group(staypoints[1].totalPrecip.group())
        .x(d3.scale.linear()
        .domain([0, 10])
        .rangeRound([0, width]))
        .tickLabels([...Array(10).keys()])
        .numTicks(9),

    barChart()
        .dimension(staypoints[1].snow)
        .group(staypoints[1].snow.group())
        .x(d3.scale.linear()
        .domain([0, 20])
        .rangeRound([0, width]))
        .tickLabels([...Array(20).keys()])
        .numTicks(9),


    barChart()
        .dimension(staypoints[1].duration)
        .group(staypoints[1].duration.group())
        .x(d3.scale.linear()
        .domain([0, 1600])
        .rangeRound([0, width]))
        .tickLabels([...Array(1600).keys()])
        .numTicks(9),
];