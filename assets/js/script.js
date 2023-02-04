let searchHistory   = JSON.parse(localStorage.getItem('searchHistory')) ?? [];
let historyDiv      = $("#history");
let weatherInfoDiv  = $("#weather-info");
let forecasts       = [];
let apiKey          = "e19c832c79e2ceedde14f29140fad364"
let today, city, todaysWeather;

function init() {
    today = moment().format("LLLL");
    city = "Sheffield";
    createHistory();
    getCoordinates(city);
}

function createHistory() {
    historyDiv.empty();
    let historyList = $("<ul>").attr("id","history-list");
    historyDiv.append(historyList);
    for (let i=0; i<searchHistory.length; i++){
        let location = $("<button>").text(searchHistory[i]).attr("data-location", searchHistory[i]);
        location.addClass("curved-border")
        historyList.append(location);
    }
}

//function to get coords by city
function getCoordinates(city) {
    $.ajax({
        url: `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`,
        method: "GET"
    })
    .then(function(response) {
        getWeather(response[0]); //it returns an array with one object inside
    });
}

//function to use above coords to get the weather forecast
function getWeather(coords){
    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`,
        method: "GET"
      })
      .then(function(response) {
        createWeatherInfo(response); //sends over an object with a list of weather every 3 hours
      });
}

//function to construct html using the above weather forecast
function createWeatherInfo(weather) {
    //section for updating the div where id = "today"
    let weatherHeader = $("<h2>").text(`${city} - ${today}`);
    let temp = weather.list[0].main.temp;
    let tempEl = $("<p>").text(`Temperature - ${temp} °C`)
    let wind = weather.list[0].wind.speed;
    let windEl = $("<p>").text(`Wind speed - ${wind} km/h`);
    let humidity = weather.list[0].main.humidity;
    let humidityEl = $("<p>").text(`Humidity - ${humidity}%`);
    
    $("#today").append(weatherHeader, tempEl, windEl, humidityEl);
    
    //section for updating the div where id = "forecast"
    //iterates through 5 times to get the next 5 days
    let forecastList = $("<ul>").addClass("forecast-list");
    $("#forecast").append(forecastList);
    for (let i = 1; i<=5; i++){
        //uses find and moment().fromNow() to find the object with the time in i day(s) from now 
        var dailyForecast = weather.list.find(obj => {
            console.log(i);
            if (i===1){    
                return moment(obj.dt_txt).fromNow() === `in a day`;
            }
            else{
                return moment(obj.dt_txt).fromNow() === `in ${i} days`;
            }
        })
        let dailyBlock = $("<li>").addClass("daily-block");
        weatherHeader = $("<p>").text(`${moment(dailyForecast.dt_txt).format("Do MMMM")}`);
        temp = dailyForecast.main.temp;
        tempEl = $("<p>").text(`Temperature - ${temp} °C`)
        wind = dailyForecast.wind.speed;
        windEl = $("<p>").text(`Wind speed - ${wind} km/h`);
        humidity = dailyForecast.main.humidity;
        humidityEl = $("<p>").text(`Humidity - ${humidity}%`);

        dailyBlock.append(weatherHeader, tempEl, windEl, humidityEl);
        forecastList.append(dailyBlock);

        console.log(dailyForecast);
    }
}



init();