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
        var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + `${targetCity}&appid=${APIKEY}`;

        //call ajax on click
        $.ajax({
            method: "GET",
            url: queryURL        
        }).then(function(result){
            console.log(result);

            // fill main weather pane
            $("#currentWeatherCity").text(result.name); // city name label

            $("#currentWeatherIcon").attr("src", `https://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png`);

            $("#currentTempSpan").html(`${tempKtoC(result.main.temp)}&deg;C`);
            $("#currentHumiditySpan").text(`${result.main.humidity}%`);
            $("#currentWindSpan").text(`${result.wind.speed}m/s`);
            $("#currentUVSpan").text();

            // fill five-day forecast panes
        });



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