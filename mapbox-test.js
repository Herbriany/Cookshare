require('dotenv').config();

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

async function geocode(location) { 
    try {
        let response = await geocodingClient.forwardGeocode({
            query: location,
            limit: 2
        })
        .send()
        let parsed_response = JSON.parse(response.rawBody).features[1].center
        console.log(parsed_response);
    }
    catch(err) {
        console.log(err.message);
    }
}

geocode("Alaska, US")
