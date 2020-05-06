const clear = document.getElementById('clear-distance');
clear.addEventListener('click', e => {
    e.preventDefault;
    document.getElementById('location').value = '';
    document.querySelector('input[type=radio]:checked').checked = false;
});

// users location finder code
function geoFindMe(e) {
    e.preventDefault();
    const status = document.querySelector('#status');
    const locationInput = document.querySelector('#location');

    function success(position) {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        status.textContent = '';
        locationInput.value = `[${longitude}, ${latitude}]`;
    }

    function error() {
        status.textContent = 'Unable to find your location'
    }

    if (!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported in your browser';
    }
    else {
        status.textContent = 'Locating...'
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

document.querySelector('#find-me').addEventListener('click', geoFindMe);