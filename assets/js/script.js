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
        location.addClass("history-button curved-border")
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
        url: `http://api.openweathermap.org/data/2.5/forecast/?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`,
        method: "GET"
      })
      .then(function(response) {
        createWeatherInfo(response); //sends over an object with a list of weather every 3 hours
      });
}

//function to construct html using the above weather forecast
function createWeatherInfo(weather) {
    //section for updating the div where id = "today"
    $("#today").empty();
    $("#forecast").empty();

    let weatherHeader = $("<h2>").text(`${city} - ${today}`);
    let weatherIcon = `http://openweathermap.org/img/wn/${weather.list[0].weather[0].icon}@2x.png`;
    let weatherIconEl = $("<img>").attr("src", weatherIcon).addClass("weather-icon");
    let temp = weather.list[0].main.temp;
    let tempEl = $("<h3>").text(`Temperature - ${temp} °C`);
    let wind = weather.list[0].wind.speed;
    let windEl = $("<h3>").text(`Wind speed - ${wind} km/h`);
    let humidity = weather.list[0].main.humidity;
    let humidityEl = $("<h3>").text(`Humidity - ${humidity}%`);
    
    $("#today").append(weatherHeader, weatherIconEl, tempEl, windEl, humidityEl);
    
    //section for updating the div where id = "forecast"
    //iterates through 5 times to get the next 5 days
    let forecastList = $("<ul>").addClass("forecast-list");
    $("#forecast").append(forecastList);
    for (let i = 1; i<=5; i++){
        let dailyBlock = $("<li>").addClass("daily-block");
        //always refers to weather.list[i*8-1] to get the following day's data, to the previous 3 hour interval
        // i.e. if it is currently 9:01 it'll get 9, and if it is 11:59 it'll also get 9
        weatherHeader = $("<h3>").text(`${moment(weather.list[i*8-1].dt_txt).calendar()}`);
        weatherIcon = `http://openweathermap.org/img/wn/${weather.list[i*8-1].weather[0].icon}@2x.png`;
        weatherIconEl = $("<img>").attr("src", weatherIcon);
        temp = weather.list[i*8-1].main.temp;
        tempEl = $("<p>").text(`Temperature - ${temp} °C`);
        humidity = weather.list[i*8-1].main.humidity;
        humidityEl = $("<p>").text(`Humidity - ${humidity}%`);

        dailyBlock.append(weatherHeader, weatherIconEl, tempEl, humidityEl);
        forecastList.append(dailyBlock);
    }
}

$("#search-button").on("click", function(event){
    event.preventDefault();
    if(!$(this).parent().siblings("input").val()){
        return;
    }
    else{ 
        city = $(this).parent().siblings("input").val();
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
        createHistory();
        getCoordinates(city);
    }
})

// ensured event listener is on document for when new buttons are added to history
$(document).on("click", ".history-button", function(){
    city = $(this).text();
    getCoordinates(city);
})

init();