// Your OpenWeatherMap API key
const apiKey = "d8e4637e71e5784aee34a5193ff7352b";

// Get references to the input, button, and results container
const cityInput = document.getElementById("city");
const getWeatherButton = document.getElementById("getWeather");
const weatherResultDiv = document.getElementById("weatherResult");
const solarResultDiv = document.getElementById("solarResult"); // New reference for solar energy section

// Add event listener to the "Get Weather" button
getWeatherButton.addEventListener("click", () => {

// Add "Enter" key functionality
cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission or default behavior
    getWeather(); // Call the same function as clicking the button
  }
});
  
// Fetch and display weather data
function getWeather() {
  const city = cityInput.value.trim();
  
  // Check if the input is empty
  if (!city) {
    weatherResultDiv.innerHTML = "Please enter a city name.";
    solarResultDiv.innerHTML = ""; // Clear solar result if no city is entered
    return;
  }

  // Fetch weather data from the OpenWeatherMap API
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      // Extract relevant data from the API response
      const { name, main, weather, clouds, sys } = data;
      const sunrise = new Date(sys.sunrise * 1000).toISOString().split("T")[1].slice(0, 5); // Convert to HH:MM
      const sunset = new Date(sys.sunset * 1000).toISOString().split("T")[1].slice(0, 5); // Convert to HH:MM

      // Display the weather details
      weatherResultDiv.innerHTML = `
        <h2>${name}</h2>
        <p>Temperature: ${main.temp}°C</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Cloud Cover: ${clouds.all}%</p>
        <p>Sunrise: ${sunrise}</p>
        <p>Sunset: ${sunset}</p>
      `;

      // Calculate solar panel energy generation
      const energy = calculateSolarEnergy(clouds.all, sunrise, sunset);
      solarResultDiv.innerHTML = `
        <h3>Solar Panel Energy Estimate</h3>
        <p>Based on current weather, a 1.6m² solar panel can generate approximately:</p>
        <p><strong>${energy} Wh</strong> of energy per day.</p>
      `;
    })
    .catch(error => {
      // Handle errors (e.g., city not found, network issues)
      weatherResultDiv.innerHTML = "Error fetching weather data. Please try again.";
      solarResultDiv.innerHTML = ""; // Clear solar result if there's an error
      console.error(error);
    });
});

// Function to calculate solar panel energy generation
function calculateSolarEnergy(clouds, sunrise, sunset) {
  const panelArea = 1.6; // 1.6 m² average panel
  const efficiency = 0.2; // 20% efficiency
  const currentTime = new Date(); // Current time

 // Convert sunrise, sunset, and current time to comparable Date objects
  const sunriseTime = new Date(`1970-01-01T${sunrise}:00Z`);
  const sunsetTime = new Date(`1970-01-01T${sunset}:00Z`);

  // Check if it's nighttime
  if (currentTimeUTC < sunriseTime || currentTimeUTC > sunsetTime) {
    return "0.00"; // No energy generation at night
  }

  // Daytime calculation
  const solarIrradiance = 1000 * ((100 - clouds) / 100); // Adjust for cloud cover
  const hoursOfSunlight = ((sunsetTime - sunriseTime) / (1000 * 60 * 60); // Calculate daylight duration
  const energy = solarIrradiance * panelArea * efficiency * hoursOfSunlight; // Energy in watt-hours
  
  return energy.toFixed(2); // Round to 2 decimal places
}

