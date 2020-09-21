$(document).ready(function(){

    //variables here
    var cityStorage = localStorage;
    //API components
    const APIKEY = "8f6847d25cfbaf48f56f29eac435ee01";
    var targetCity = "";
    

    //function to retrieve from local storage on load

    //function to save searches to local storage
    
    //search button
    $("#searchButton").on("click",function(){
        event.preventDefault;
        console.log($("#searchTermEntry").val());
        targetCity = $("#searchTermEntry").val();
        var targetCityLon = "";
        var targetCityLat = "";
        
        // ajax for current weather API
        $.ajax({
            method: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + `${targetCity}&appid=${APIKEY}`        
        }).then(function(currentResponse){
            console.log(currentResponse);

            // fill main weather pane
            $("#currentWeatherCity").text(currentResponse.name); // city name label
            // current date here
            $("#currentWeatherIcon").attr("src", `https://openweathermap.org/img/wn/${currentResponse.weather[0].icon}@2x.png`); // weather icon

            $("#currentTempSpan").html(`${tempKtoC(currentResponse.main.temp)}&deg;C`); // current temperature
            $("#currentHumiditySpan").text(`${currentResponse.main.humidity}%`); // current humidity
            $("#currentWindSpan").text(`${currentResponse.wind.speed}m/s`); // current wind

            //get target coords for UV call
            targetCityLon = currentResponse.coord.lon;
            targetCityLat = currentResponse.coord.lat;

            // ajax for current UV index API call
            $.ajax({
                method: "GET",
                url: "http://api.openweathermap.org/data/2.5/uvi?appid=" + `${APIKEY}&lat=${targetCityLat}&lon=${targetCityLon}`
            }).then(function(UVresponse){
                console.log(UVresponse);

                // fill current weather UV span
                $("#currentUVSpan").text(UVresponse.value);
                var UVunit = parseInt(UVresponse.value);
                console.log(UVunit);
                // color UV display according to rating
                if (UVunit <= 2){
                    // #97D700
                    $("#currentUVSpan").css("background-color", "#97D700");
                } else if (UVunit >= 3 && UVunit <= 5 ){
                    // #FCE300
                    $("#currentUVSpan").css("background-color", "#FCE300");
                } else if (UVunit >= 6 && UVunit <= 7){
                    // #FF8200
                    $("#currentUVSpan").css("background-color", "#FF8200");
                } else if (UVunit >= 8 && UVunit <= 10){
                    // #EF3340
                    $("#currentUVSpan").css("background-color", "#EF3340");
                } else if (UVunit >= 11){
                    // #9063CD
                    $("#currentUVSpan").css("background-color", "#9063CD");
                }
            });
        });



        // ajax for 5-day forecast API call

        //add current search to sidebar
        var newRecentSearchLI = $("<li>");
        newRecentSearchLI.attr("class", "list-group-item")
        $("#resultList").append(newRecentSearchLI);
        var newRecentSearchLink = $("<a href=\"\"></a>");
        newRecentSearchLink.text(targetCity);
        newRecentSearchLink.attr("data-city",targetCity);
        newRecentSearchLink.attr("class","recentSearchItem");
        newRecentSearchLI.append(newRecentSearchLink);
        
    });

    // function to re-display data for previous search results by clicking on entry in search result list
    $(".recentSearchItem").on("click", function(){
        event.preventDefault;
        console.log(`clicked on ${this.data-city}`);
    });

    //temperature conversion
    function tempKtoC(Ktemp){
        var Ctemp = Ktemp - 273.15;
        return Math.floor(Ctemp);
    }
});