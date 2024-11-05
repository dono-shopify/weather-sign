const apiKey = 'API_KEY';
const city = 'Halifax'
const units = 'metric';

// Degrees to Cardinal conversion
function getCardinalDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    return directions[Math.round(degrees / 45) % 8];
}

// Title case lol
function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

async function getWeather() {
    // Convert location to lat long
    const locationResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`);
    const locationData = await locationResponse.json();

    if (locationData.cod === 200) {
        const lat = locationData.coord.lat;
        const lon = locationData.coord.lon;

        // Get weather
        const oneCallResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=${units}`);
        const weatherData = await oneCallResponse.json();

        // Update current weather
        //document.getElementById('city').innerText = locationData.name;
        document.getElementById('temperature').innerText = Math.round(weatherData.current.temp);
        document.getElementById('weatherDescription').innerText = toTitleCase(weatherData.current.weather[0].description);

        // Convert wind speed from m/s to knots
        const windSpeedMps = weatherData.current.wind_speed;
        const windSpeedKnots = (windSpeedMps * 1.94384).toFixed(0);
        document.getElementById('currentWindSpeed').innerText = windSpeedKnots;

        // Get wind direction in degrees and convert to cardinal
        const windDirectionDegrees = weatherData.current.wind_deg;
        const windDirectionCardinal = getCardinalDirection(windDirectionDegrees);
        document.getElementById('currentWindDirection').innerText = `${windDirectionDegrees}° ${windDirectionCardinal}`;

        // Set the icon URL
        const iconCode = weatherData.current.weather[0].icon; // Access the first weather condition's icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        // Update the image source in your HTML
        const weatherIcon = document.getElementById("weatherIcon");
        weatherIcon.src = iconUrl;
        
        // Move the arrow
        const arrow = document.getElementById("windArrow");
        arrow.style.transform = `rotate(${windDirectionDegrees}deg)`;

        // Update forecast
        const forecastList = document.getElementById('forecast');
        forecastList.innerHTML = ''; // Clear previous forecast

        weatherData.daily.slice(1, 4).forEach(day => {
            const windSpeedForecastKnots = (day.wind_speed * 1.94384).toFixed(0);
            const windGustForecastKnots = (day.wind_gust * 1.94384).toFixed(0);
            const windForecastDirectionDegrees = day.wind_deg
            const windForecastDirectionCardinal = getCardinalDirection(windForecastDirectionDegrees)
            const date = new Date(day.dt * 1000).toLocaleDateString();
            const listItem = document.createElement('li');
           
            listItem.innerText = `${date}: Wind Forecast - ${windSpeedForecastKnots} g ${windGustForecastKnots} kts ${windForecastDirectionDegrees}° (${windForecastDirectionCardinal})`;
         forecastList.appendChild(listItem);
        });
    } else {
        document.getElementById('city').innerText = 'City not found';
        document.getElementById('temperature').innerText = '';
        document.getElementById('weatherDescription').innerText = '';
        document.getElementById('currentWindSpeed').innerText = '';
        document.getElementById('currentWindDirection').innerText = '';
        document.getElementById('forecast').innerHTML = '';
    }
}

getWeather();
