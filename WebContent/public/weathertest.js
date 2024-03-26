function submitCityName(inputIdOrCityName, displayId) {
    let cityName;
    var idDisplay = false;
    console.log(`${inputIdOrCityName} name`);
    if (document.getElementById(inputIdOrCityName)) {
        cityName = document.getElementById(inputIdOrCityName).value;
        console.log(`${cityName} here`);
        idDisplay = true;
    } else {
        // Otherwise, treat it as the city name itself
        cityName = inputIdOrCityName;
    }
    

    fetch('/weather/getWeatherByCity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName: cityName }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if(idDisplay){
            displayWeatherDataId(data,displayId);
        } else{
            displayWeatherData(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById(displayId).innerHTML = "Failed to load weather data.";
    });
}


function displayWeatherData(data) {
    // Toggle visibility of the weather panel
    const weatherPanel = document.getElementById('weatherPanel');
    weatherPanel.style.display = 'block';
    if (!data || !weatherPanel) {
        console.error('Weather data or panel is missing.');
        return;
    }
    
    // Update city name
    const cityNameEl = document.getElementById('cityName');
    if (cityNameEl && data.location && data.location.name) {
        cityNameEl.textContent = `${data.location.name}`;
    }
    
    // Update temperature
    const temperatureEl = document.getElementById('temperature');
    if (temperatureEl && data.current && data.current.temp_c !== undefined) {
        temperatureEl.textContent = `${data.current.temp_c}°C`;
    }
    
    // Update condition
    const conditionEl = document.getElementById('condition');
    if (conditionEl && data.current && data.current.condition && data.current.condition.text) {
        conditionEl.textContent = `${data.current.condition.text}`;
    }
    
    // Update weather icon
    const weatherIconEl = document.getElementById('weatherIcon');
    if (weatherIconEl && data.current && data.current.condition && data.current.condition.icon) {
        weatherIconEl.src = data.current.condition.icon;
        weatherIconEl.style.display = 'block'; // Show the icon
    } else if (weatherIconEl) {
        weatherIconEl.style.display = 'none'; // Hide the icon if not available
    }
}

function displayWeatherDataId(data, displayId) {
    const weatherDisplay = document.getElementById(displayId);
    if (weatherDisplay && data.location && data.current && data.current.condition) {
        weatherDisplay.innerHTML = `
            <div class="weather-info">
                <span class="weather-location">${data.location.name}</span>
                <span class="weather-temperature">${data.current.temp_c}°C</span>
                <span class="weather-condition">${data.current.condition.text}</span>
            </div>
        `;
        
        // Optionally, show an icon if available
        if (data.current.condition.icon) {
            weatherDisplay.innerHTML += `<img class="weather-icon" src="${data.current.condition.icon}" alt="Weather Icon">`;
        }

        // Make sure to display the container in case it's initially hidden
        weatherDisplay.style.display = 'block';
    } else {
        weatherDisplay.innerHTML = '<p>Weather data is not available.</p>';
    }
}

async function getCurrForecast(cityName) {
    try {
        // First, insert the forecast data
        await fetch('/weather/insertForecast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cityName }),
        });

        // Then, query the inserted data
        const queryResponse = await fetch(`/weather/queryWeatherByCity?cityName=${encodeURIComponent(cityName)}`);
        const queriedData = await queryResponse.json();
        if (document.getElementById('weatherForecast')) {
            document.getElementById('weatherForecast').innerHTML = `
                <div class="weather-city">${cityName}</div>
                <div class="weather-forecasts">
                    ${queriedData.map(data => `
                        <div class="weather-forecast-entry">
                            <span class="forecast-date">${getDayOfWeek(data.forecast_date)}</span>
                            <span class="forecast-temperature">${data.temperature}°C</span>
                            <img class="forecast-description" src="${data.icon}"></img>
                        </div>
                    `).join('')}
                </div>`;
        } else if (document.getElementById('forecast') && queriedData.length > 0) {
            let today = queriedData[0];
            let tomorrow = queriedData[1];
            let third = queriedData[2];

            document.getElementById('forecast').innerHTML= `
                <h1>${today.city}</h1>
                <div class="today">
                    <h2>Today</h2>
                    <h2>${today.temperature}°C</h2>
                    <img src="${today.icon}" alt="Weather Forecast" width="100">
                    <p>Humidity: ${today.humidity}%</p>
                    <p>Wind Speed: ${today.wind_speed} kph </p>
                </div>
                <div class="tomorrow">
                    <h2>Tomorrow</h2>
                    <h2>${tomorrow.temperature}°C</h2>
                    <img src="${tomorrow.icon}" alt="Weather Forecast" width="100">
                    <p>Humidity: ${tomorrow.humidity}%</p>
                    <p>Wind Speed: ${tomorrow.wind_speed} kph </p>
                </div>
                <div class="today">
                    <h2>${getDayOfWeek(third.forecast_date)}</h2>
                    <h2>${third.temperature}°C</h2>
                    <img src="${third.icon}" alt="Weather Forecast" width="100">
                    <p>Humidity: ${third.humidity}%</p>
                    <p>Wind Speed: ${third.wind_speed} kph </p>
                </div>
            `;
        }

       

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('weatherForecast').textContent = 'Failed to fetch weather data.';
    }
}

function getDayOfWeek(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    const dayOfWeek = date.getUTCDay();
    return days[dayOfWeek];
}