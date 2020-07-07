// Define dimensions of svg object that will hold globe:
var width = 960,
  height = 500;

var proj = d3.geoOrthographic()
  .scale(230)
  .translate([width / 2, height / 2])
  // change this to 180 for transparent globe
  .clipAngle(90);

// Create a geographic projection that will serve as our globe:
var path = d3.geoPath().projection(proj).pointRadius(1.5);

var graticule = d3.geoGraticule();

// ---> Needs to be deleted
// Define coordinates of main location, London (NOT NEEDED FOR OUR PROJECT):
var london = [-0.118667702475932, 51.5019405883275];

var time = Date.now();
var rotate = [39.666666666666664, -30];
var velocity = [0.015, -0];

// Create a dotted line connecting a particular point to London (NOT NEEDED FOR OUR PROJECT):
var lineToLondon = function (d) {
  return path({ "type": "LineString", "coordinates": [london, d.geometry.coordinates] });
};

// Strip white space in a string:
function stripWhitespace(str) {
  return str.replace(" ", "");
}

// Create an svg element that will hold our globe:
var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

svg.call(d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged));

// Import world-110m.json, which contains map data (countries and continents). Also import test-earthquake.json, which consists of our testing dataset:
// queue()
d3.queue()
  // removed the old version of world map topojson file and added the new version
  // .defer(d3.json, "/earthquake/static/data/world-110m.json")
  .defer(d3.json, "static/data/countries-110m.json")
  // The earthquake Geojson data file to be plotted on the globe
  .defer(d3.json, "static/data/quake_cleaned.geojson")
  .await(ready);

function ready(error, world, places) {
  svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class", "noclicks")
    .attr("fill", "none");

  // Append country and continent outlines to globe:
  svg.append("path")
    .datum(topojson.object(world, world.objects.land))
    .attr("class", "land")
    .attr("d", path);

  // Append graticules (map gridlines) to globe:
  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule noclicks")
    .attr("d", path);

  // OLD CODE:
  // Append city locations to globe:
  svg.append("g").attr("class", "points")
    .selectAll("text").data(places.features)
    .enter().append("path")
    .attr("class", "point")
    .attr("d", path);

  // NEW CODE:
  // Append earthquake locations to globe and add mouseover event that displays earthquake info:
  svg.append("g").attr("class", "points")
    .selectAll("text").data(places.features)
    .enter().append("path")
    .attr("class", "point")
    .attr("d", path)
    .on("mouseover", function (d) {
      var loc = d.properties.name;
      var ctry = d.properties.country;
      var mag = d.properties.magnitude;
      var reg = d.properties.region;
      var display_str = "Location: " + loc + " | Country: " + ctry + " | Region:" + reg + " | Magnitude:" + mag;
      d3.select("g.info")
        .select("text.distance")
        .html(display_str)
        // .text("Location: " + location + "Country: " + country)
        // Not working for some reason? How do we display multiple lines of text?
        ;
    })
    .on("mouseout", function (d) {
      var name = stripWhitespace(d.properties.name);
      //
      d3.select("g.lines").select("#" + name).style("stroke-opacity", 0.3);
      d3.select("g.info").select("text.distance").text("Info: Hover Over A Location");
    });

  // Commented out this section as it is not relevant to the project
  // Append dotted lines that will connect
  // svg.append("g").attr("class","lines")
  //     .selectAll(".lines").data(places.features)
  //   .enter().append("path")
  //     .attr("class", "lines")
  // 		.attr("id", d => stripWhitespace(d.properties.name))
  //     .attr("d", d => lineToLondon(d));

  // Commenting this section out, since it is not relevant to our project:
  // svg.append("g").attr("class", "labels")
  //   .selectAll("text").data(places.features)
  //   .enter().append("text")
  //   .attr("class", "label")
  //   .text(d => d.properties.name)
  //   .on("mouseover", (d) => {
  //     var distance = Math.round(d3.geoDistance(d.geometry.coordinates, london) * 6371);
  //     d3.select("g.info").select("text.distance").text("Distance from London: ~" + distance + "km");
  //     var name = stripWhitespace(d.properties.name);
  //     d3.select("g.lines").select("#" + name).style("stroke-opacity", 1);
  //   })
  //   .on("mouseout", (d) => {
  //     var name = stripWhitespace(d.properties.name);
  //     d3.select("g.lines").select("#" + name).style("stroke-opacity", 0.3);
  //     d3.select("g.info").select("text.distance").text("Distance from London: Hover Over A Location");
  //   });

  svg.append("g").attr("class", "countries")
    .selectAll("path")
    .data(topojson.object(world, world.objects.countries).geometries)
    .enter().append("path")
    .attr("d", path);

  position_labels();

  svg.append("g").attr("class", "info")
    .append("text")
    .attr("class", "distance")
    .attr("x", width / 20)
    .attr("y", height * 1)
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .text("Info: Hover Over A Location");

  refresh();

  spin();
}

function position_labels() {
  var centerPos = proj.invert([width / 2, height / 2]);

  svg.selectAll(".label")
    .attr("text-anchor", (d) => {
      var x = proj(d.geometry.coordinates)[0];
      return x < width / 2 - 20 ? "end" :
        x < width / 2 + 20 ? "middle" :
          "start";
    })
    .attr("transform", (d) => {
      var loc = proj(d.geometry.coordinates),
        x = loc[0],
        y = loc[1];
      var offset = x < width / 2 ? -5 : 5;
      return "translate(" + (x + offset) + "," + (y - 2) + ")";
    })
    .style("display", (d) => {
      var d = d3.geoDistance(d.geometry.coordinates, centerPos);
      return (d > 1.57) ? 'none' : 'inline';
    });

}

function refresh() {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".countries path").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
  svg.selectAll(".point").attr("d", path);
  // svg.selectAll(".lines").attr("d", (d) => { if (d) { return lineToLondon(d); }});
  position_labels();
}

var timer;

function spin() {
  timer = d3.timer(function () {
    var dt = Date.now() - time;

    proj.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);

    refresh();
  });
}

function dragstarted() {
  timer.stop();
  v0 = versor.cartesian(proj.invert(d3.mouse(this)));
  r0 = proj.rotate();
  q0 = versor(r0);
}

function dragged() {
  var v1 = versor.cartesian(proj.rotate(r0).invert(d3.mouse(this))),
    q1 = versor.multiply(q0, versor.delta(v0, v1)),
    r1 = versor.rotation(q1);
  proj.rotate(r1);
  refresh();
}