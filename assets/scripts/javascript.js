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

 // we want to attempt to center the map at the user's present location
 // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        // create geolocation object of user's position
        var userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // for map center, offset longitude to push map to right
        var mapCenter = {
        	lat: position.coords.latitude,
         	lng: position.coords.longitude-.6
        };

        // send user position to addMarker function
		addMarker(userPos, map);

        // update map object with new center location
        map.setCenter(mapCenter);
      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

// pass a lat/lng object to this function to place a marker on the map
function addMarker(pos, thisMap){
    var marker = new google.maps.Marker({
      position: pos,
      map: thisMap
    });
	
	// place infoWindow location at userPos
  	//infoWindow.setPosition(pos);
        
    // message user in the infoWindow
    //infoWindow.setContent('You are here \(we think\).');
}

  // this code is straight from google API documentation, for handling errors that occur during attempted browser geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }