$(document).ready(function(){

    //variables here
    var cityStorage = localStorage;
    var cityList= [];
    //API components
    const APIKEY = "8f6847d25cfbaf48f56f29eac435ee01";
    var targetCity = "";
    var targetCityLon = "";
    var targetCityLat = "";
    
    //function to retrieve from local storage on load
    function retrievePastSearches(){
        if (cityStorage.getItem("pastWeatherCities") != undefined){
            cityList = JSON.parse(cityStorage.getItem("pastWeatherCities"));
            for (var i = 0; i < cityList.length; i++){
                //add past list to sidebar
                var newRecentSearchLink = $("<a href=\"\#\"></a>");
                newRecentSearchLink.text(cityList[i]);
                newRecentSearchLink.attr("data-city",cityList[i]);
                newRecentSearchLink.attr("class","recentSearchItem list-group-item list-group-item-action");
                $("#resultList").prepend(newRecentSearchLink);
            }
        }
    }

    // call storage retrieval
    retrievePastSearches();

    //function to save searches to local storage
    function savePastSearches(){
        cityStorage.setItem("pastWeatherCities", JSON.stringify(cityList));
    }
    
    //search button
    $("#searchButton").on("click",function(){
        event.preventDefault;
        console.log($("#searchTermEntry").val());
        targetCity = $("#searchTermEntry").val();
        
        // call ajax for current weather API
        getCurrentWeatherData(targetCity);        
    });

    //function to get current weather for selected location
    function getCurrentWeatherData(cityName){
        $.ajax({
            method: "GET",
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + `${cityName}&appid=${APIKEY}`        
        }).then(function(currentResponse){
            console.log(currentResponse);

            //add current search to sidebar
            // first check if a matching entry is already there
            var alreadyInList = false;
            for (var a = 0; a < $("#resultList").children().length; a++){
                var existingEntry = $("#resultList").children().get(a).textContent;
                if (existingEntry === cityName){
                    console.log(`${existingEntry} already in list`);
                    alreadyInList = true;
                }
            }
            // if not there already, add it in
            if (alreadyInList === false){
                var newRecentSearchLink = $("<a href=\"\#\"></a>");
                newRecentSearchLink.text(cityName);
                newRecentSearchLink.attr("data-city",cityName);
                newRecentSearchLink.attr("class","recentSearchItem list-group-item list-group-item-action");
                newRecentSearchLI.append(newRecentSearchLink);
            
                // update local storage
                cityList.push(cityName);
                savePastSearches();
            }

            // fill main weather pane
            $("#currentWeatherCity").text(currentResponse.name); // city name label
            $("#currentWeatherIcon").attr("src", `https://openweathermap.org/img/wn/${currentResponse.weather[0].icon}@2x.png`); // weather icon
            $("#currentTempSpan").html(`${tempKtoC(currentResponse.main.temp)}&deg;C`); // current temperature
            $("#currentHumiditySpan").text(`${currentResponse.main.humidity}%`); // current humidity
            $("#currentWindSpan").text(`${currentResponse.wind.speed}m/s`); // current wind

            //get target coords for UV call
            targetCityLon = currentResponse.coord.lon;
            targetCityLat = currentResponse.coord.lat;

            // call ajax for current UV index API
            getUVIndex(targetCityLat,targetCityLon);

            getFiveDayForecast(cityName);
        });
    }

    //function to get UV index for selected location
    function getUVIndex(latitude, longitude){
        $.ajax({
            method: "GET",
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + `${APIKEY}&lat=${latitude}&lon=${longitude}`
        }).then(function(UVresponse){
            console.log(UVresponse);

            // fill current weather UV span
            $("#currentUVSpan").text(UVresponse.value);
            var UVunit = parseInt(UVresponse.value);
            console.log(UVunit);

            // color UV display according to official UV Index categories
            if (UVunit <= 2){
                // Low Index
                $("#currentUVSpan").css("background-color", "#97D700");
                $("#currentUVSpan").css("color", "#000000");
            } else if (UVunit >= 3 && UVunit <= 5 ){
                // Moderate Index
                $("#currentUVSpan").css("background-color", "#FCE300");
                $("#currentUVSpan").css("color", "#000000");
            } else if (UVunit >= 6 && UVunit <= 7){
                // High Index
                $("#currentUVSpan").css("background-color", "#FF8200");
                $("#currentUVSpan").css("color", "#FFFFFF");
            } else if (UVunit >= 8 && UVunit <= 10){
                // Very High
                $("#currentUVSpan").css("background-color", "#EF3340");
                $("#currentUVSpan").css("color", "#FFFFFF");
            } else if (UVunit >= 11){
                // Extreme
                $("#currentUVSpan").css("background-color", "#9063CD");
                $("#currentUVSpan").css("color", "#FFFFFF");
            }

            // get current date from UV API call
            $("#currentWeatherDate").text(dateYMDtoDMY(UVresponse.date_iso));

          
        });
    }

    // function to get 5-day forecast for selected location
    function getFiveDayForecast(location){
        // clear any existing five-day forecast cards
        $("#fiveDayCardsRow").empty();

        var fiveDayForecastList = []; // store one entry for each day
        $.ajax({
            method: "GET",
            url: `https://api.openweathermap.org/data/2.5/forecast/?q=` +`${location}&appid=${APIKEY}`
        }).then(function(fiveDayResponse){
            console.log(fiveDayResponse);
            var responseList = fiveDayResponse.list;
            for (var l = 0; l < responseList.length; l++){ //search through list of forecasts
                // eventually, update this to get local midday rather than utc midday
                if (responseList[l].dt_txt.includes("12:00:00")){
                    fiveDayForecastList.push(responseList[l]); //extract one forecast per day
                }
            }
            console.log(fiveDayForecastList);
            // display each of the five-day forecasts on the screen
           for (var f = 0; f < fiveDayForecastList.length; f ++){
                var fiveDayCardDateTxt = dateYMDtoDMY(fiveDayForecastList[f].dt_txt);
                var fiveDayCardIconSrc = `https://openweathermap.org/img/wn/${fiveDayForecastList[f].weather[0].icon}@2x.png`;
                var fiveDayCardTempTxt = `Temp: ${tempKtoC(fiveDayForecastList[f].main.temp)} °C`;
                var fiveDayCardHumidTxt = `Humidity: ${fiveDayForecastList[f].main.humidity}%`;

                // make html
                var newFiveDayCard = document.createElement("div");
                $(newFiveDayCard).attr("class", "fiveDayCard card m-3");
                $("#fiveDayCardsRow").append(newFiveDayCard);
                var newFiveDayCardBody = $("<div>");
                $(newFiveDayCard).append(newFiveDayCardBody);
                $(newFiveDayCardBody).attr("class", "card-body");
                // date heading
                var newFiveDayCardHeading = document.createElement("h4");
                $(newFiveDayCardHeading).attr("class", "card-title fiveDayDate");
                $(newFiveDayCardHeading).text(fiveDayCardDateTxt);
                $(newFiveDayCardBody).append(newFiveDayCardHeading);
               // weather icon
                var newFiveDayCardIcon = document.createElement("img");
                $(newFiveDayCardIcon).attr("src", fiveDayCardIconSrc);
                $(newFiveDayCardBody).append(newFiveDayCardIcon);
               // temperature
                var newFiveDayCardTemp = document.createElement("p");
                $(newFiveDayCardTemp).text(fiveDayCardTempTxt);
                $(newFiveDayCardBody).append(newFiveDayCardTemp);
                // humidity
                var newFiveDayCardHumidity = document.createElement("p");
                $(newFiveDayCardHumidity).text(fiveDayCardHumidTxt);
                $(newFiveDayCardBody).append(newFiveDayCardHumidity);
           }
        });
    }

    // function to re-display data for previous search results by clicking on entry in search result list
    $(".recentSearchItem").click(function(){
        event.preventDefault;
        console.log(`clicked on ${this.dataset.city}`);
        getCurrentWeatherData(this.dataset.city);
    });

    //temperature conversion
    function tempKtoC(Ktemp){
        var Ctemp = Ktemp - 273.15;
        return Math.floor(Ctemp);
    }
    // rearrange date
    function dateYMDtoDMY(dateYMD){
        var dateParts = dateYMD.split("-");
        var dateDay = dateParts[2].substr(0,2);
        var dateMonth = dateParts [1];
        var dateYear = dateParts[0];
        var dateDMY = `${dateDay}\/${dateMonth}\/${dateYear}`;
        return dateDMY;
    }
});