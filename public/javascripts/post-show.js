mapboxgl.accessToken = 'pk.eyJ1IjoiYnJpbGFuZCIsImEiOiJjazdtMHF3aDEwY2IwM2RwaXJ4bzE2anh4In0.bvvBWjNmdiaNkDuaQA3s9g';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: post.coordinates, // starting position [lng, lat]
    zoom: 6 // starting zoom
});

// create a HTML element for each feature
var el = document.createElement('div');
el.className = 'marker';

// make a marker for each feature and add to the map
new mapboxgl.Marker(el)
.setLngLat(post.coordinates)
.setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
.setHTML('<h3>' + post.title + '</h3><p>' + post.location + '</p>'))
.addTo(map);
    