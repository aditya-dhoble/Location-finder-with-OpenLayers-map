var coordinates_text = "";
var jsonText = document.getElementById("jsontext");
var markerImg = document.getElementById("marker_img");
const imageContainer = document.querySelector(".image-container");



// converting coordinates.txt to json file
async function fetchDoc() {
  const resp = await fetch('Images/coordinates.txt');
  const text = await resp.text();
  return text;
}

async function textToGeoJson() {
  coordinates_text = await fetchDoc();
  const coordinates_entries = coordinates_text.split("\n");
  // const headers = coordinates_entries[0].split();
  var coordinates = []

  coordinates_entries.map((entry, i) => {
    if (i != 0){
      coordinates.push(entry.split(" "))
    }
  })

  var geo_json = {
    "type": "FeatureCollection",
    "features": []
  }
  coordinates.map(coordinate => {
    var json = {
      "type": "Feature",
      "properties": {
        "image_src": coordinate[0]
      },
      "geometry": {
        "coordinates": [
          coordinate[2],
          coordinate[3]
        ],
        "type": "Point"
      }
    };
    geo_json["features"].push(json);
  });

  return geo_json;
}

const geo_json = textToGeoJson();


// Getting the map from openlayer
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([10.93376479, 50.98380407]), 
    zoom: 19,
  }),
});

// using maptiler to get the coordinates by putting a separate layer onto map
const locations = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'https://api.maptiler.com/data/09fa164f-bef6-4b5f-b2b5-e85ef10ad89a/features.json?key=rqP86fuiSVYlSauTyInI',
    format: new ol.format.GeoJSON(),
  })
})

map.addLayer(locations);

// Adding initial panorama image
var viewer = new PANOLENS.Viewer({
  container: imageContainer
});
var panoramaImage = new PANOLENS.ImagePanorama("Images/HMTpano_000001_000000.jpg");
viewer.add(panoramaImage);

// Vector feature
map.on('click', function(e){

  var feature = map.forEachFeatureAtPixel(e.pixel, function(feature){
    // console.log(e.pixel)
    // console.log(feature.values_.geometry.flatCoordinates)
    return feature;
  })


  if (feature) {
    var img_src = feature.values_.image_src;
    var img = new Image();
    img.src = `images/${img_src}`;

    if (imageExists(img.src)){                                                                                                                                                                                 
      viewer.dispose(panoramaImage)
      panoramaImage = new PANOLENS.ImagePanorama(`images/${img_src}`);
      viewer.add(panoramaImage);
    } else {
      alert("No image exists for selected location")
    }

    // function to check if the image exists for the particular image source string
    function imageExists(image_url){

      var http = new XMLHttpRequest();
  
      http.open('HEAD', image_url, false);
      http.send();
  
      return http.status != 404;
  
    }
  }

})