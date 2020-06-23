
var map = L.map('map')
  .setView(
    [-41.2858, 174.7868],
    13
  );

// Refer to https://docs.mapbox.com/api/maps/#static-tiles for the API Documentation.
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
}).addTo(map);

// To be deleted
// mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
// L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; ' + mapLink + ' Contributors',
//   maxZoom: 18,
// }).addTo(map);

// Add an SVG element to Leaflet’s overlay pane
var svg = d3.select(map.getPanes().overlayPane).append("svg"),
  g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Use this link to get the geojson data.
var link = "static/data/rectangle.json";
// var link = "static/data/sample.json";

d3.json(link, function (geoShape) {
  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geo.transform({ point: projectPoint }),
    path = d3.geo.path().projection(transform);

  // create path elements for each of the features
  d3_features = g.selectAll("path")
    .data(geoShape.features)
    .enter().append("path");

  map.on("viewreset", reset);

  reset();

  // fit the SVG element to leaflet's map layer
  function reset() {

    bounds = path.bounds(geoShape);

    var topLeft = bounds[0],
      bottomRight = bounds[1];

    svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    // initialize the path data
    d3_features.attr("d", path)
      .style("fill-opacity", 0.7)
      .attr('fill', 'blue');
  }

  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

});
