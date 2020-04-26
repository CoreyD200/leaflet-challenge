// connect to data sources

let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

let faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


renderMap(earthquakeURL, faultLinesURL);

// get data and create maps

function renderMap(earthquakeURL, faultLinesURL) {

  // Get earthquake data
    d3.json(earthquakeURL, function(data) {
       console.log(earthquakeURL)
    // Stores response into earthquakeData
    let earthquakeData = data;
    // Performs GET request for the fault lines URL
    d3.json(faultLinesURL, function(data) {
      // Stores response into faultLineData
      let faultLineData = data;

      // Passes data into createFeatures function
      createFeatures(earthquakeData, faultLineData);
    });
  });

  // Function to create features
  function createFeatures(earthquakeData, faultLineData) {

    // Create markers and popups for each earthquake
    function onEachQuakeLayer(feature, layer) {
      return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: 1,
        color: chooseColor(feature.properties.mag),
        fillColor: chooseColor(feature.properties.mag),
        radius:  markerSize(feature.properties.mag)
      });
    }
    function onEachEarthquake(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }

    // add fault lines
    function onEachFaultLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    }

    // Creates a GeoJSON layer containing the features array of the earthquakeData object
    // Run the onEachEarthquake & onEachQuakeLayer functions once for each element in the array
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachEarthquake,
      pointToLayer: onEachQuakeLayer
    });

    // Creates a GeoJSON layer containing the features array of the faultLineData object
    // Run the onEachFaultLine function once for each element in the array
    let faultLines = L.geoJSON(faultLineData, {
      onEachFeature: onEachFaultLine,
      style: {
        weight: 2,
        color: 'blue'
      }
    });

    createMap(earthquakes, faultLines);
  }

  // Function to create map
  function createMap(earthquakes, faultLines) {
    // Define outdoors, satellite, and darkmap layers
    // Outdoors layer
    var satellite= L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
    
    var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });
    
    var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold base layers
    let baseMaps = {
      "Light": graymap,
      "Satellite": satellite,
      "Dark": dark,
    };

    // Create overlay object to hold overlay layers
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": faultLines
    };

    // Create map, default settings: outdoors and faultLines layers display on load
    let map = L.map("map", {
      center: [39.8283, 0.5785],
      zoom: 2,
      layers: [satellite, faultLines],
      scrollWheelZoom: true
    });

    // Add layer button with maps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    // Adding legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };
    legend.addTo(map);


  }
}


// Define color for each magnintude

function chooseColor(magnitude) {
  return magnitude > 5 ? "red":
    magnitude > 4 ? "orange":
      magnitude > 3 ? "gold":
        magnitude > 2 ? "yellow":
          magnitude > 1 ? "yellowgreen":
            "greenyellow"; 
}

// Create circles based off of magnitude size
function markerSize(magnitude) {
  return magnitude * 4;
}