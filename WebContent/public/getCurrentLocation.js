function requestUserLocation() {
    const userAgreed = window.confirm("We need your location to provide local weather information. Do you allow us to access your location?");
    if(userAgreed){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getCityName(latitude, longitude, (cityName) => {
                console.log("Callback with cityName:", cityName);
                submitCityName(cityName, 'currentWeather');
                getCurrForecast(cityName);
            });
        }, function(error) {
            console.error("Error occurred: " + error.message);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        console.log("Geolocation is not supported by your browser.");
    }
    }
}

function getCityName(latitude, longitude) {
    return new Promise((resolve, reject) => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                if (data.address && data.address.city) {
                    console.log("City: " + data.address.city);
                    resolve(data.address.city); // Resolve with city name
                } else if (data.address && (data.address.town || data.address.village)) {
                    console.log("Location: " + (data.address.town || data.address.village));
                    resolve(data.address.town || data.address.village); // Resolve with town or village name
                } else {
                    reject(new Error('City name not found in the data')); // Reject if city name not found
                }
            })
            .catch(error => {
                console.error("Error fetching city name: ", error.message);
                reject(error); // Reject with error
            });
    });
}





module.exports.getCityName = getCityName;
