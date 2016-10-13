(function () {
  getLocation();

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        console.log(lat);
        console.log(lon);
        getCurrentFromLatLon(lat, lon);
        getFiveDayFromLatLon(lat, lon);
      });
    } else {
      console.log('geolocation is not available')
    }
  }

  function getCurrentFromLatLon(lat, lon) {
    var url = "https://api.openweathermap.org/data/2.5/weather?";
    url += 'lat=' + lat + '&';
    url += 'lon=' + lon + '&';
    url += 'units=imperial&'
    url += 'APPID=831088fa35ccfb407172f8df99fa5bb4';

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    
    request.setRequestHeader("Access-Control-Allow-Origin", "*");
    request.setRequestHeader("Access-Control-Allow-Methods", "GET");
    request.setRequestHeader('Access-Control-Allow-Header', 'Origin, Content-Type, X-Auth-Token');

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        formatTodayHTML(data);
      } else {
        console.log('Issue communicating with server');
      }
    }

    request.onerror = function () {
      console.log(request.response);
    }

    request.send();
  }

  function getFiveDayFromLatLon(lat, lon) {
    var url = "https://api.openweathermap.org/data/2.5/forecast/daily?";
    url += 'cnt=6&';
    url += 'lat=' + lat + '&';
    url += 'lon=' + lon + '&';
    url += 'units=imperial&'
    url += 'APPID=831088fa35ccfb407172f8df99fa5bb4';
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("access-control-allow-origin", "*");
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        formatFiveDayHTML(data);
      } else {
        console.log('Issue communicating with server');
      }
    }
    request.onerror = function () {
      console.log(request.response);
    }
    request.send();
  }

  function formatTodayHTML(data) {
    var todayJson = data;
    var currentDay = document.getElementsByClassName('current-day');
    currentDay[0].innerHTML = todayHtml(todayJson);
    var originalState = currentDay[0].innerHTML;
    currentDay[0].addEventListener('click', function () {
      if (document.getElementsByClassName('back').length === 0) {
        this.classList.add('detail');
        currentDay[0].innerHTML = addBackButton(true) + currentDay[0].innerHTML + getAdditionalDetails(todayJson);
      } else {
        this.classList.remove('detail');
        currentDay[0].innerHTML = originalState;
      }

    });
  }
  var originalState = '';
  function formatFiveDayHTML(data) {
    var forecastJson = data.list.splice(1, 5);
    var fiveDay = document.getElementsByClassName('five-day');
    var html = forecastJson.map(function (day, index) {
      return fiveDayHtml(day, index);
    }).join('');

    fiveDay[0].innerHTML = html;

    dayEvent = document.getElementsByClassName('day');

    for (var i = 0; i < dayEvent.length; i++) {
      dayEvent[i].addEventListener('click', function (e) {

        var listener = this;
        
        var elData = Array.prototype.find.call(forecastJson, function(children, index){
          return children.dt == listener.getAttribute('id');
        })

        var siblings = Array.prototype.filter.call(dayEvent, function (children) {
          return children !== listener;
        });

        if (document.getElementsByClassName('back').length === 0) {
          originalState = listener.innerHTML;
          document.getElementsByClassName('current-day')[0].classList.add('hide');
          document.getElementsByClassName('five-day')[0].classList.add('expand');

          Array.prototype.forEach.call(siblings, function (sibling) {
            sibling.classList.add('hide');
          });
          listener.classList.remove('flex-container');
          listener.classList.add('detail');

          listener.innerHTML = addBackButton(false) + getDayDetail(elData);
        } else {
          document.getElementsByClassName('current-day')[0].classList.remove('hide');
          document.getElementsByClassName('five-day')[0].classList.remove('expand');
          Array.prototype.forEach.call(siblings, function (sibling) {
            sibling.classList.remove('hide');
          });
          listener.classList.remove('detail');
          listener.innerHTML = originalState;
          listener.classList.add('flex-container');
        }
      });
    }
  }

  function todayHtml(day) {
    var dateString = new Date(day.dt * 1000);
    var date = getMonth(dateString.getMonth()) + " " + dateString.getDate();
    var icon = iconCode(day.weather[0].icon);
    var todayString = "<div class='flex-container'>";
    todayString += "<div class='flex-50 flex-column day-summary justify-space-between'>";
    todayString += "<div class='current-date'>Today, " + date + "</div>";
    todayString += "<div class='current-high'>" + Math.round(day.main.temp_max) + "°</div>";
    todayString += "<div class='current-low'>" + Math.round(day.main.temp_min) + "°</div>";
    todayString += "</div>";
    todayString += "<div class='flex-50 flex-column align-center justify-space-between day-picture'>";
    todayString += "<img src='./assets/img/drawable-hdpi/art_" + icon + ".png' alt='" + icon + "'>";
    todayString += "<div class='current-status'>" + day.weather[0].main + "</div>";
    todayString += "</div>";
    todayString += "</div>";

    return todayString;
  }

  function fiveDayHtml(day, index) {
    var dateTime = new Date(day.dt * 1000);
    var dayName = index === 0 ? 'Tomorrow' : getDayOfWeek(dateTime.getDay());
    var dayString = ""
    dayString += "<div id='"+day.dt+"' class='day flex-container justify-space-between'>";
    dayString += " <div class='flex-10 flex-container justify-center align-center'>";
    dayString += "  <img src='./assets/img/drawable-hdpi/ic_" + iconCode(day.weather[0].icon) + ".png' alt='' />"
    dayString += " </div>"
    dayString += " <div class='border flex-60 flex-column justify-space-around'>"
    dayString += "  <div class='day-name'>" + dayName + "</div>"
    dayString += "  <div class='day-status'>" + day.weather[0].main + "</div>"
    dayString += " </div>"
    dayString += " <div class='border flex-10 flex-column justify-space-around'>"
    dayString += "  <div class='day-high'>" + Math.round(day.temp.max) + "°</div>"
    dayString += "  <div class='day-low'>" + Math.round(day.temp.min) + "°</div>"
    dayString += " </div>"
    dayString += "</div>"

    return dayString;
  }

  function getDayDetail(day){
    console.log(day);
    var dateString = new Date(day.dt * 1000);
    var dayOfWeek = getDayOfWeek(dateString.getDay());
    var date = getMonth(dateString.getMonth()) + " " + dateString.getDate();
    var image = iconCode(day.weather[0].icon);
    var dayDetailString = "<div class='flex-container'>";
    dayDetailString += "<div class='flex-50 flex-column day-summary justify-space-between'>";
    dayDetailString += "<div class='current-date'>" +dayOfWeek + ", " + date + "</div>";
    dayDetailString += "<div class='current-high'>" + Math.round(day.temp.max) + "°</div>";
    dayDetailString += "<div class='current-low'>" + Math.round(day.temp.min) + "°</div>";
    dayDetailString += "</div>";
    dayDetailString += "<div class='flex-50 flex-column align-center justify-space-between day-picture'>";
    dayDetailString += "<img src='./assets/img/drawable-hdpi/art_" + image + ".png' alt='" + image + "'>";
    dayDetailString += "<div class='current-status'>" + day.weather[0].main + "</div>";
    dayDetailString += "</div>";
    dayDetailString += "</div>";
    dayDetailString += "<div class='additional-details flex-column justify-space-between'>";
    dayDetailString += "<div class='humidity'>Humidity: " + day.humidity +"% </div>";
    dayDetailString += "<div class='wind'>Wind Speed: " + Math.round(day.speed) + " km/h " + direction(day.deg) + "</div>";
    dayDetailString += "<div class='pressure'> Pressure: " + Math.round(day.pressure) + " hpa</div>";
    dayDetailString += "</div>";

    return dayDetailString
  }

  function getAdditionalDetails(data) {
    console.log(data);
    var additionalDetails='';
    additionalDetails = "<div class='additional-details flex-column justify-space-between'>";
    additionalDetails += "<div class='humidity'>Humidity: " + data.main.humidity +"% </div>";
    additionalDetails += "<div class='wind'>Wind Speed: " + data.wind.speed + "km/h " + direction(data.wind.deg) +"</div>";
    additionalDetails += "<div class='pressure'> Pressure: " + Math.round(data.main.pressure) + " hpa</div>";
    additionalDetails += "</div>";

    return additionalDetails;
  }

  function iconCode(code) {
    if (code === "01n" || code === "01d") {
      return "clear";
    } else if (code === "02n" || code === "02d") {
      return "light_clouds";
    } else if (code === "03n" || code === "03d" || code === "04n" || code === "04d") {
      return "cloudy";
    } else if (code === "09n" || code === "09d") {
      return "light_rain";
    } else if (code === "10n" || code === "10d") {
      return "rain";
    } else if (code === "11n" || code === "11d") {
      return "storm";
    } else if (code === "13n" || code === "13d") {
      return "snow";
    } else if (code === "50n" || code === "50d") {
      return "fog";
    }
  }

  function getDayOfWeek(date) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date];
  }

  function getMonth(date) {
    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return month[date];
  }

  function addBackButton(extraPadding) {
    if (extraPadding){
      var backButton = "<div class='flex-container align-center back extra-padding'>";
    } else {
      var backButton = "<div class='flex-container align-center back'>";
    }
    backButton += "<i class='material-icons'>arrow_back</i>";
    backButton += "<span>Back</span>";
    backButton += "</div>";

    return backButton;
  }

  function direction(deg){
    if ((deg >= 0 && deg < 15) || (deg >=345 && deg < 360)){
      return "N";
    } else if(deg >= 15 && deg < 60){
      return "NE";
    } else if(deg >= 60 && deg < 110){
      return "E";
    } else if (deg >= 110 && deg < 155){
      return "SE";
    } else if (deg >= 155 && deg < 200){
      return "S";
    } else if (deg >= 200 && deg < 250 ){
      return "SW";
    } else if (deg >= 250 && deg < 300){
      return "W";
    } else if (deg >= 300 && deg < 345){
      return "NW"
    } else {
      return ""
    }
  }
})()
