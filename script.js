// Your OpenWeatherMap API key
const apiKey = "d8e4637e71e5784aee34a5193ff7352b";

// Get references to the input, button, and results container
const cityInput = document.getElementById("city");
const getWeatherButton = document.getElementById("getWeather");
const weatherResultDiv = document.getElementById("weatherResult");
const solarResultDiv = document.getElementById("solarResult"); // New reference for solar energy section

// Add event listener to the "Get Weather" button
getWeatherButton.addEventListener("click", () => {
  // Get the city name entered by the user
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
      const { name, main, weather, clouds } = data;

      // Display the weather details
      weatherResultDiv.innerHTML = `
        <h2>${name}</h2>
        <p>Temperature: ${main.temp}°C</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Cloud Cover: ${clouds.all}%</p>
      `;

      // Calculate solar panel energy generation
      const energy = calculateSolarEnergy(clouds.all);
      solarResultDiv.innerHTML = `
        <h3>Solar Panel Energy Estimate</h3>
        <p>Based on current weather, a 1.5m² solar panel can generate approximately:</p>
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
function calculateSolarEnergy(clouds, hoursOfSunlight = 5) {
  const solarIrradiance = 1000 * ((100 - clouds) / 100); // Adjust for cloud cover
  const panelArea = 1.5; // 1.5 m² average panel
  const efficiency = 0.2; // 20% efficiency
  const energy = solarIrradiance * panelArea * efficiency * hoursOfSunlight; // Energy in watt-hours
  return energy.toFixed(2); // Round to 2 decimal places
}

