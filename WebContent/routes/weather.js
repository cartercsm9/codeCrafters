const express = require('express');
const router = express.Router();
const db = require('../database.js');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY;


//endpoint to get current weather data by city name 
router.post('/getWeatherByCity', async (req, res) => {
    const { cityName } = req.body;

    // Geocoding URL to get coordinates for the city name
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${GEOCODING_API_KEY}`;

    try {
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();
        console.log(geoData);


        if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];

            // Fetch weather data using the coordinates
            const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            console.log(weatherData);

            res.json(weatherData); // Send weather data back to the client
        } else {
            throw new Error("City not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});


// Endpoint to handle city name submission and respond with weather forecast data
router.post('/insertForecast', async (req, res) => {
    console.log('inserting weather data');
    const { cityName } = req.body;
    try {
        const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${cityName}&days=3&aqi=no&alerts=yes`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData && weatherData.forecast && weatherData.forecast.forecastday) {
            await Promise.all(weatherData.forecast.forecastday.map(forecastDay => {
                const city = cityName;
                const forecast_date = forecastDay.date; // Use just the date for simplicity
                const temperature = forecastDay.day.maxtemp_c;
                const weather_description = forecastDay.day.condition.text;
                const icon = forecastDay.day.condition.icon;
                const humidity = forecastDay.day.avghumidity;
                const wind_speed = forecastDay.day.maxwind_kph;
                // Add any additional fields you're interested in here

                const sql = 'INSERT INTO weather_data (city, forecast_date, temperature, weather_description, icon, humidity, wind_speed) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const values = [city, forecast_date, temperature, weather_description, icon, humidity, wind_speed];
                // Add any additional fields to the values array

                return new Promise((resolve, reject) => {
                    db.query(sql, values, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            }));
            res.json({ message: "Weather data inserted successfully." });
        } else {
            console.log("No forecast data available or invalid response.");
            res.status(400).json({ error: "No forecast data available or invalid response." });
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Error fetching weather data." });
    }
});


// Endpoint to query weather data by city name
router.get('/queryWeatherByCity', async (req, res) => {
    const { cityName } = req.query;
    const sql = `
        SELECT DISTINCT 
            city, 
            forecast_date, 
            temperature, 
            weather_description,
            icon,
            humidity,
            wind_speed
        FROM weather_data
        WHERE forecast_date >= CURRENT_DATE AND city = ?;
        `;
    db.query(sql, [cityName], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).json({ error: "Error querying weather data." });
        } else {
            res.json(result);
        }
    });
});

// Define route to fetch historical weather data
router.get('/grabOldWeather', async (req, res) => {
    console.log('Request received to fetch historical weather data');

    const query = `SELECT forecast_date, city, temperature, weather_description 
                   FROM weather_data 
                   WHERE forecast_date < CURDATE()`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching historical weather data:', err);
            res.status(500).send('Error fetching historical weather data');
        } else {
            console.log('Sending historical weather data:', results);

            if (results.length === 0) {
                console.log('No historical weather data found'); // Debug statement
                res.status(404).json({ error: 'No historical weather data found' });
            } else {
                res.json(results); // Send the fetched data as JSON response
            }
        }
    });
});







// Export the router
module.exports = router;
