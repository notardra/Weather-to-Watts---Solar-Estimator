// Your OpenWeatherMap API key
const apiKey = "d8e4637e71e5784aee34a5193ff7352b";

// Get references to the input, button, and results container
const cityInput = document.getElementById("city");
const getWeatherButton = document.getElementById("getWeather");
const weatherResultDiv = document.getElementById("weatherResult");
const solarResultDiv = document.getElementById("solarResult");

// Add "Enter" key functionality
cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    getWeather();
  }
});

// Add event listener to the "Get Weather" button
getWeatherButton.addEventListener("click", getWeather);

// Fetch and display weather data
function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    weatherResultDiv.innerHTML = "Please enter a city name.";
    solarResultDiv.innerHTML = "";
    return;
  }

  console.log(`Fetching weather data for: ${city}`);

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`City not found: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Weather data received:", data);

      const { name, main, weather, clouds, sys, timezone, dt } = data;

      // Calculate the city's current local time
      const cityDate = new Date();
      // Get the city's offset in minutes from UTC
      const cityOffsetInMinutes = timezone / 60;
      // Get the local offset in minutes
      const localOffsetInMinutes = cityDate.getTimezoneOffset();
      // Calculate the total offset in milliseconds
      const totalOffsetInMs = (cityOffsetInMinutes + localOffsetInMinutes) * 60 * 1000;
      
      // Apply the offset to get the correct city time
      const cityTime = new Date(cityDate.getTime() + totalOffsetInMs);
      
      const localTime = cityTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      console.log("Current Local Time:", localTime);

      // Calculate sunrise time
      const sunriseDate = new Date(sys.sunrise * 1000);
      const sunriseCity = new Date(sunriseDate.getTime() + (timezone * 1000));
      const adjustedSunrise = sunriseCity.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Calculate sunset time
      const sunsetDate = new Date(sys.sunset * 1000);
      const sunsetCity = new Date(sunsetDate.getTime() + (timezone * 1000));
      const adjustedSunset = sunsetCity.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      console.log("Sunrise (Local):", adjustedSunrise);
      console.log("Sunset (Local):", adjustedSunset);

      // Calculate solar panel energy generation
      const energy = calculateSolarEnergy(
        clouds?.all || 0,
        sunriseCity.getTime(),
        sunsetCity.getTime(),
        cityTime.getTime(),
        timezone
      );

      // Display weather details
      weatherResultDiv.innerHTML = `
        <h2>${name}, ${sys.country}</h2>
        <p>Temperature: ${main.temp}°C</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Cloud Cover: ${clouds?.all || 0}%</p>
        <p>Local Time: ${localTime}</p>
      `;

      // Display solar panel energy estimate only if it's daytime
      if (energy !== null) {
        solarResultDiv.innerHTML = `
          <h3>Solar Panel Energy Estimate</h3>
          <p>Based on current weather, a 1.6m² solar panel can generate approximately:</p>
          <p><strong>${energy} Wh</strong> of energy per day.</p>
        `;
      } else {
        solarResultDiv.innerHTML = `
          <h3>Solar Panel Energy Estimate</h3>
          <p>It's currently nighttime. Solar panels cannot generate energy at night.</p>
        `;
      }
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
      weatherResultDiv.innerHTML = `Error fetching weather data: ${error.message}. Please try again.`;
      solarResultDiv.innerHTML = "";
    });
}

// Function to calculate solar panel energy generation
function calculateSolarEnergy(clouds, sunrise, sunset, currentTime, isDaytime) {
  if (!isDaytime) {
    return null;
  }

  const panelArea = 1.6; // 1.6 m² average panel
  const efficiency = 0.2; // 20% efficiency

  // Daytime calculation
  const solarIrradiance = 1000 * ((100 - clouds) / 100); // Adjust for cloud cover
  const hoursOfSunlight = (sunset - sunrise) / (1000 * 60 * 60); // Daylight duration in hours
  const energy = solarIrradiance * panelArea * efficiency * hoursOfSunlight;

  return energy.toFixed(2); // Round to 2 decimal places
}
