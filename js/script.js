//set up the map
var geojsonLayer;
var map = L.map('map').setView([40.712784, -74.005941], 11);

//set up basemap tiles from mapbox
L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
  minZoom: 10,
  attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);

//load external geoJSON files
$.getJSON('js/nynta2.geojson', function(data) {
  var nynta2Data = data;
  geojsonLayer = L.geoJson(nynta2Data.features, {
    style: addStyle,
    onEachFeature: addInteractivity
  }).addTo(map);
});

//the following was constructed with the assistance of Leaflet's Interactive Choropleth Map tutorial (http://leafletjs.com/examples/choropleth.html#map)

// get color depending on residential unit value
function getColor(d) {
    return d > 10000 ? '#045A8D' : d > 5000 ? '#2B8CBE' : d > 2000 ? '#74A9CF' :
      d > 1000 ? '#A6BDDB' : d > 500 ? '#D0D1E6' : '#F1EEF6';
  }

//adding style to geojson layer
function addStyle(feature) {
    return {
      fillColor: getColor(feature.properties.ResUnits),
      weight: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  }

//highlight feature on mouseover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 2,
      color: 'white',
      fillOpacity: 1
    });
    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
    info.update(layer.feature.properties);
  }

//reset highlight on mouseout
function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
  }

//add popups on hover
var info = L.control();
info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

//update the control based on feature properties passed
info.update = function(props) {
  this._div.innerHTML = '<h4>NYC Residential Construction</h4>' + (props ?
    '<b>' + props.NTAName + '</b><br />' + props.BoroName + '</b><br />' +
    props.ResUnits + ' Residential Units' : 'Hover over a neighborhood');
};
info.addTo(map);

//adding interactivity to geojson layer
function addInteractivity(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });
  }

//add legend to map
var legend = L.control({
  position: 'bottomright'
});
legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 500, 1000, 2000, 5000, 10000],
    labels = [],
    from, to;
  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];
    labels.push('<i style="background:' + getColor(from + 1) + '"></i> ' + from +
      (to ? '&ndash;' + to : '+'));
  }
  div.innerHTML = labels.join('<br>');
  return div;
};
legend.addTo(map);

//the following was constructed with the assistance of d3noob's Simple d3.js bar chart (https://gist.github.com/d3noob/8952219)

//add Manhattan bar chart
var margin = {
    top: 20,
    right: 20,
    bottom: 250,
    left: 40
  },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom")
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
var svg = d3.select("#chart").append("svg").attr("width", width + margin.left +
    margin.right).attr("height", height + margin.top + margin.bottom).append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("MN-bar-data.csv", function(error, data) {
  data.forEach(function(d) {
    d.NTAName = d.NTAName;
    d.ResUnits = +d.ResUnits;
  });
  x.domain(data.map(function(d) {
    return d.NTAName;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d.ResUnits;
  })]);
  svg.append("g").attr("class", "x axis").attr("transform", "translate(0," +
    height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr(
    "dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)");
  svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
    "transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style(
    "text-anchor", "end")
  svg.selectAll("bar").data(data).enter().append("rect").style("fill",
    "steelblue").attr("x", function(d) {
    return x(d.NTAName);
  }).attr("width", x.rangeBand()).attr("y", function(d) {
    return y(d.ResUnits);
  }).attr("height", function(d) {
    return height - y(d.ResUnits);
  });
});

//add Brooklyn bar chart
var margin = {
    top: 20,
    right: 20,
    bottom: 250,
    left: 40
  },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom")
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
var svg1 = d3.select("#chart1").append("svg").attr("width", width + margin.left +
    margin.right).attr("height", height + margin.top + margin.bottom).append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("BK-bar-data.csv", function(error, data) {
  data.forEach(function(d) {
    d.NTAName = d.NTAName;
    d.ResUnits = +d.ResUnits;
  });
  x.domain(data.map(function(d) {
    return d.NTAName;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d.ResUnits;
  })]);
  svg1.append("g").attr("class", "x axis").attr("transform", "translate(0," +
    height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr(
    "dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)");
  svg1.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
    "transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style(
    "text-anchor", "end")
  svg1.selectAll("bar").data(data).enter().append("rect").style("fill",
    "steelblue").attr("x", function(d) {
    return x(d.NTAName);
  }).attr("width", x.rangeBand()).attr("y", function(d) {
    return y(d.ResUnits);
  }).attr("height", function(d) {
    return height - y(d.ResUnits);
  });
});

//add Queens bar chart
var margin = {
    top: 20,
    right: 20,
    bottom: 250,
    left: 40
  },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom")
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
var svg2 = d3.select("#chart2").append("svg").attr("width", width + margin.left +
    margin.right).attr("height", height + margin.top + margin.bottom).append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("QN-bar-data.csv", function(error, data) {
  data.forEach(function(d) {
    d.NTAName = d.NTAName;
    d.ResUnits = +d.ResUnits;
  });
  x.domain(data.map(function(d) {
    return d.NTAName;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d.ResUnits;
  })]);
  svg2.append("g").attr("class", "x axis").attr("transform", "translate(0," +
    height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr(
    "dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)");
  svg2.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
    "transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style(
    "text-anchor", "end")
  svg2.selectAll("bar").data(data).enter().append("rect").style("fill",
    "steelblue").attr("x", function(d) {
    return x(d.NTAName);
  }).attr("width", x.rangeBand()).attr("y", function(d) {
    return y(d.ResUnits);
  }).attr("height", function(d) {
    return height - y(d.ResUnits);
  });
});

//add Bronx bar chart
var margin = {
    top: 20,
    right: 20,
    bottom: 250,
    left: 40
  },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom")
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
var svg3 = d3.select("#chart3").append("svg").attr("width", width + margin.left +
    margin.right).attr("height", height + margin.top + margin.bottom).append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("BX-bar-data.csv", function(error, data) {
  data.forEach(function(d) {
    d.NTAName = d.NTAName;
    d.ResUnits = +d.ResUnits;
  });
  x.domain(data.map(function(d) {
    return d.NTAName;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d.ResUnits;
  })]);
  svg3.append("g").attr("class", "x axis").attr("transform", "translate(0," +
    height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr(
    "dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)");
  svg3.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
    "transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style(
    "text-anchor", "end")
  svg3.selectAll("bar").data(data).enter().append("rect").style("fill",
    "steelblue").attr("x", function(d) {
    return x(d.NTAName);
  }).attr("width", x.rangeBand()).attr("y", function(d) {
    return y(d.ResUnits);
  }).attr("height", function(d) {
    return height - y(d.ResUnits);
  });
});

//add Staten Island bar chart
var margin = {
    top: 20,
    right: 20,
    bottom: 250,
    left: 40
  },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom")
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
var svg4 = d3.select("#chart4").append("svg").attr("width", width + margin.left +
    margin.right).attr("height", height + margin.top + margin.bottom).append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("SI-bar-data.csv", function(error, data) {
  data.forEach(function(d) {
    d.NTAName = d.NTAName;
    d.ResUnits = +d.ResUnits;
  });
  x.domain(data.map(function(d) {
    return d.NTAName;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d.ResUnits;
  })]);
  svg4.append("g").attr("class", "x axis").attr("transform", "translate(0," +
    height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr(
    "dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)");
  svg4.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
    "transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style(
    "text-anchor", "end")
  svg4.selectAll("bar").data(data).enter().append("rect").style("fill",
    "steelblue").attr("x", function(d) {
    return x(d.NTAName);
  }).attr("width", x.rangeBand()).attr("y", function(d) {
    return y(d.ResUnits);
  }).attr("height", function(d) {
    return height - y(d.ResUnits);
  });
});