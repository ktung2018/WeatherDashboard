// The API key to allow for usage of the API
var APIKEY = '44cf95f6c4f45251a1df1543cae0fea2';
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// Extracts the Longitude and Latitude of a city that the client searches up THEN execute the MAIN fetch function
// Since we execute this API fetch function first, catch error on first API fetch
var extractGeoData = async function (searchedCity){
    console.log(searchedCity);
  // Execute a try and catch block to catch if there is no network
  try {
    // Update the URL with the searched city and include the API key
    var url = `http://api.openweathermap.org/geo/1.0/direct?q=${searchedCity}&limit=5&appid=${APIKEY}`;
    
    var res = await fetch(url);
    var location = await res.json();
    // If data doesn't exist, that means that the searched up city either doesn't exist or the user made a typo
    if (location.length == 0 || location == null || location == undefined) {
      alert('Please type a valid city');
    } else {
      // this function is to make sure we ONLY store the valid terms that had data
      checkHistoryBtns(searchedCity);

      // After Lat and Lon have been extracted, fetch for the MAIN data using those coordinates
      // location[0].name holds the city name which will will be passed down across multiple functions
      fetchWeather(location[0].lat, location[0].lon, location[0].name);
    }
    // If there is no network connection, execute the catch block function
  } catch (error) {
    alert('Failed to connect to API due to network issues');
  }
};

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// Using Lat and Lon values from extractGeoData(), extract the MAIN weather data
async function fetchWeather(lat, lon, location) {
  var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${APIKEY}&units=imperial`;
  var res = await fetch(url);
  var weatherData = await res.json();
  extractedData(weatherData, location);
};

// Referring to the main data set (weatherData), declare variables to hold required values
function extractedData(weatherData, location){
  var currentWeather = weatherData.current.temp;
  var humidity = weatherData.current.humidity;
  var windSpeed = weatherData.current.wind_speed;

  // For the weather icon, we extract a specific code from the data and add it to a link
  var extractedIcon = weatherData.current.weather[0].icon;
  var iconUrl = `http://openweathermap.org/img/wn/${extractedIcon}@2x.png`;

  //  Then execute updateEl() to update the DOM elements using the above data
  updateEl(
    currentWeather,
    location,
    humidity,
    windSpeed,
    iconUrl
  );

  // Execute extractForecast() to update the 5 day forecast section using the 'daily' object
  // The 'daily' object contains the weather data for other days
  var forecastWeek = weatherData.daily;
  extractForecast(forecastWeek);
};

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// Update DOM elements (textcontent) for the CURRENT DAY weather data
var updateEl = (
  currentWeather,
  location,
  humidity,
  windSpeed,
  iconUrl
) => {
  // Declare variables to hold all the required HTML
  var citynameEl = document.getElementById('city-name');
  var currentWeatherEl = document.getElementById('current-weather');
  var humidityEl = document.getElementById('humidity');
  var windspeedEl = document.getElementById('wind');
  var weatherIconEl = document.getElementById('weather-icon');

  // The following elements will show the main data set, initially, they are hidden
  var currentTemp = document.getElementById('current-temp');
  var fiveDayForecastEl = document.getElementById('five-day-forecast');

  currentTemp.style.display = 'flex';
  fiveDayForecastEl.style.display = 'unset';

  // Declare a variable to hold the current date
  var date = moment().format('(L)'); // "MM/DD/YYYY"

  // Apply the data we extracted as the textContent to the appropriate elements
  citynameEl.textContent = `${location} ${date}`;
  currentWeatherEl.textContent = `${currentWeather}°F`;
  windspeedEl.textContent = `${windSpeed} MPH`;
  humidityEl.textContent = `${humidity}%`;

  // For the weather icon, we set the src equal to the specific url we modified and we assign the styling
  weatherIconEl.src = iconUrl;
  weatherIconEl.style.height = '40px';
  weatherIconEl.style.width = '40px';
  weatherIconEl.style.display = 'flex';
};

// Update DOM elements (textcontent) for the 5 DAY FORECAST data
function extractForecast(weekData){
  // Loop through the data....
  for (let i = 0; i < weekData.length; i++) {
    // Exclude the first object since we've already used this data for the current weather
    if (i !== 0) {
      var new_date = moment(moment(), 'L').add(i, 'days').format('L'); // Increment the date by 1 day each time
      // All selectors have the same label but different numeric value so increment by 1 each time
      var weatherEl = document.getElementById(`day${i}-weather`);
      var windEl = document.getElementById(`day${i}-wind`);
      var humidityEl = document.getElementById(`day${i}-humidity`);
      var dateEl = document.getElementById(`forecast-date${i}`);
      var weatherIconEl = document.getElementById(`weather-icon-day${i}`);

      // For each day include the date
      dateEl.textContent = new_date;

      // Add the weather icon by...
      var extractedIcon = weekData[i].weather[0].icon; // Extracting the weather icon code
      var iconUrl = `http://openweathermap.org/img/wn/${extractedIcon}@2x.png`; // Adding the code in the URL
      weatherIconEl.src = iconUrl; // Applying the URL to the elements src
      weatherIconEl.style.display = 'flex'; // And then apply the necessary styles
      weatherIconEl.style.height = '40px';
      weatherIconEl.style.width = '40px';

      // Finally, add the weather, wind and humidity to the appropriate elements
      weatherEl.textContent = `${weekData[i].temp.max}/${weekData[i].temp.min}°F`;
      windEl.textContent = `${weekData[i].wind_speed} MPH`;
      humidityEl.textContent = `${weekData[i].humidity}%`;
    }

    // Since we are only running this loop for a 5 day forecast, break the loop at 5 iterations
    if (i == 5) {
      break;
    }
  }
};

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// Upon clicking the clear history button, clear the storage and reload the application
function clearHistory(){
  localStorage.clear();
  location.reload();
};

var clearHistoryBtn = document.getElementById('clear-history');
clearHistoryBtn.addEventListener('click', clearHistory);

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// All the below functions deals with generating the history buttons and...
// storing/extracting the data to/from local storage
var historyContainer = document.getElementById('history-searches');

// Check to see if an object (for the search terms) is saved locally
var localObject = localStorage.getItem('searchTerms');
// If the local storage doesn't exist....
if (localObject == null) {
  // For this session declare an empty object
  var searchHistory = [];
  // Otherwise if local storage does exist...
} else {
  // Parse the local data and update the above empty object with the data from local
  localObject = JSON.parse(localObject);
  searchHistory = localObject;
  searchHistory.forEach((item) => {
    // The functions here are the same as the ones in createHistory() below
    // This will generate the history button elements upon application load
    var btn = document.createElement('button');
    btn.classList.add('search-btn');
    btn.textContent = item.searchTerm;
    btn.type = 'button';
    historyContainer.appendChild(btn);
  });
  // Reveal the clear history button
  clearHistoryBtn.style.display = 'unset';
}

// This function will check the buttons and ONLY generate the unique history buttons
function checkHistoryBtns(label){
  var uniqueButton = true;
  // Make the first letter of the search term uppercase then...
  // add it with the original term but exclude the first letter
  var finalLabel = label[0].toUpperCase() + label.substring(1);

  // If the object length is 0, generate the button normally
  if (searchHistory.length == 0) {
    clearHistoryBtn.style.display = 'unset';

    // Generate the button elements
    createButtons(finalLabel);
    // Pushes the search term to an object then stores that object to local storage
    storeLocally(searchHistory, finalLabel);
    // Set to false so we don't double generate
    uniqueButton = false;
    // Execute this here to make sure it is working at this state as well
    historyBtnEvent();
  } else {
    // Go through ALL data, if the current label matches with a label in our object,
    // set uniqueButton to false so that we don't generate the button
    searchHistory.forEach((item) => {
      if (item.searchTerm == finalLabel) {
        uniqueButton = false;
      }
    });
  }

  // Only generate the button if it is unique and not already existing in the object
  if (uniqueButton) {
    createButtons(finalLabel);
    // Pushes the search term to an object then stores that object to local storage
    storeLocally(searchHistory, finalLabel);
    // Execute this here to make sure it is working at this state as well
    historyBtnEvent();
  }
};

// Generate the history search buttons upon hitting search
//var createButtons = (finalLabel) => {
function createButtons(finalLabel){
  // Create a button element
  var btn = document.createElement('button');
  // Add a 'search-btn' class to each button
  btn.classList.add('search-btn');
  // Then update the textcontent with the final label
  btn.textContent = finalLabel;
  // Add a type of 'button' so that these buttons don't submit the form
  btn.type = 'button';
  // Append the button(s) to the container
  historyContainer.appendChild(btn);
};

// Stores object to local storage
function storeLocally(object, label){
  // Push the label and a unique ID to the object
  var id = Math.floor(Math.random() * 10000);
  searchHistory.push({ searchTerm: label, id });

  // Then store the full object locally
  localStorage.setItem('searchTerms', JSON.stringify(object));
};

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// This executes the event listener for all active history buttons
const historyBtnEvent = () => {
  // Declare a variable to hold the active history buttons
  var historyBtns = document.getElementById('history-searches');

  // Iterate over each child and add a 'click' event listener...
  Array.prototype.forEach.call(historyBtns.children, (child) => {
    child.addEventListener('click', () => {
      // Whatever button the user clicks on....
      // Extract the innerText of each button and execute the main function according to that value
      extractGeoData(child.innerText.toLowerCase());
    });
  });
};
// Execute globally so it works right away
historyBtnEvent();

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

// Declare variables to hold the form and input field elements
var inputEl = document.getElementById('enter-city');
var formEl = document.getElementById('main-form');

// Upon form submission....
formEl.addEventListener('submit', (e) => {
  e.preventDefault; // Prevent browser refresh
  if (inputEl.value) {
    // If the input value is NOT empty....
    extractGeoData(inputEl.value.toLowerCase()); // Use the value from the input field to execute the main function
  } else {
    // Else if the value is empty, alert the user
    alert('Please enter a city');
  }
  // The above value would be the city name that the user picks
  inputEl.value = ''; // Reset value for the input field
});


















