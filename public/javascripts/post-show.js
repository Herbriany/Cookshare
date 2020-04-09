if (post.geometry.coordinates.length > 0) {
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: post.geometry.coordinates, // starting position [lng, lat]
        zoom: 6 // starting zoom
    });

    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';

    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
    .setLngLat(post.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    .setHTML('<h3>' + post.title + '</h3><p>' + post.location + '</p>'))
    .addTo(map);
}

// toggle edit review form

const editButtons = document.querySelectorAll(".toggle-edit-form");
editButtons.forEach( editButton => {
    editButton.addEventListener("click", function() {
        this.textContent === "Edit" ? this.textContent = "Cancel" : this.textContent = "Edit";
        this.nextElementSibling.style.display !== "block" ? this.nextElementSibling.style = "display: block" : this.nextElementSibling.style = "display: none";
    });
});

// clear star review button

const clearButtons = document.querySelectorAll(".clear-rating"); 
clearButtons.forEach( clearButton => {
    clearButton.addEventListener("click", function() {
        this.nextElementSibling.checked = true;
    })
}) 
