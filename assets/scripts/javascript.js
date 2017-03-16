// Initialize Firebase
var config = {
apiKey: "AIzaSyAmK1XtRt48lGcJC9249vs6gGmNAelrFpQ",
authDomain: "eventdb-1f7c6.firebaseapp.com",
databaseURL: "https://eventdb-1f7c6.firebaseio.com",
storageBucket: "eventdb-1f7c6.appspot.com",
messagingSenderId: "330315538394"
};
firebase.initializeApp(config);
var db = firebase.database();

// init map callback for google maps api
function initMap(){
	// create map object using google maps api method
	var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10
      	});
	// create window object with google maps api
	var infoWindow = new google.maps.InfoWindow({map: map});

 // we want to attempt to center the map at the user's present location
 // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        infoWindow.setPosition(userPos);
        infoWindow.setContent('You are here \(we think\).');
        map.setCenter(userPos);
      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  }