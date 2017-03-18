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
var events = [];

// init map callback for google maps api
function initMap(){
	// create map object using google maps api method
	map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10
      	});
	var infoWindow = new google.maps.InfoWindow({
		content: '<p>You are here (we think)</p>'
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
        // on wider screens, offset longitude to push map to right
        if (window.innerWidth > 1000) {
          var lngOffset = .5
          var latOffset = -.2;
        }
        else {
          var lngOffset = 0;
          var latOffset = .2;
        }
        var mapCenter = {
        	lat: position.coords.latitude+latOffset,
         	lng: position.coords.longitude-lngOffset
        };

        // send user position to addMarker function
		   // don't actually need a user location marker; the map will be centered near them. 
       //addMarker(userPos,infoWindow);

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

// function to add multiple markers from search response
// resultData will be array of objects in format:
// [{type: 'restaurant'|'event', name: '<name>', other response key-value pairs},{result2 object}, {result3 object}] 
function showResults(resultData) {
	console.log(resultData);
	// loop through result data array
	for (var i=0;i<resultData.length;i++){
		// create InfoWindow
		var thisWindow = new google.maps.InfoWindow({
			content: ''
		})
	}
}

// pass a lat/lng object ('pos' argument) and infoWindow content ('markerInfo') to this function to place a clickable marker on the map
function addMarker(pos,markerInfo){
    var marker = new google.maps.Marker({
      position: pos,
      map: map
    });
    // put listener on this marker to open the marker info in an infowindow
    marker.addListener('click', function() {
    	markerInfo.open(map, this);
  	});
    }

  // this code is straight from google API documentation, for handling errors that occur during attempted browser geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }

$(document).ready(function(){

// testing geocode function
var address = '23 Woods Bay Road, Bluffton SC';
var myInfo = new google.maps.InfoWindow({
    content: '<h2>My house</h2>'
  });

// if address is not lat/lng, we need to geocode it
geoAddress = geocode(address,function(geocodedAddress){
  addMarker(geocodedAddress,myInfo)
});


}); // end doc ready

// returns stringy address as {lat,lng} object
function geocode(address,latLngCallback){
  // API call to google geocoding service - takes address (encoded) and api key
  var urlQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(address)+'&key=AIzaSyAmK1XtRt48lGcJC9249vs6gGmNAelrFpQ';
  $.ajax({
    url: urlQuery,
    method: 'GET'
  }).done(function(response){
    latLngCallback(response.results[0].geometry.location);
  });
}


// to do
// can use circle symbols of various sizes to represent popularity of restaurant (if available);
/* test stuff   */

$("#eventTester").on("click", function(){
    // restaurant ajax stuff here



  var oArgs = {

        app_key: 'GRMfQ3CqpWsGdfXM',

        q: "",

        where: "31401",

        within: '10',

        "date": "Next Week",

        page_size: 10,

        sort_order: "popularity",

     };

    
    events = [];


     EVDB.API.call("/events/search", oArgs, function(oData) {
        let position = {};
        let name, info;
        let address = '';
        let eventsArr = oData.events.event;

        for(var i in eventsArr){
          
          position = {
            lat: parseFloat( eventsArr[i].latitude ),
            lng: parseFloat( eventsArr[i].longitude )
          }

          address = eventsArr[i].venue_address + ', ' + eventsArr[i].city_name + ', ' + eventsArr[i].region_abbr;
          // console.log( position )
          // console.log( address )
          

          if( eventsArr[i].description == null){
            info = 'This is no information for this event.'
          }
          else{
            info = eventsArr[i].description
          }
          if( eventsArr[i].image == null ){
            imageURL = '';
          }
          else{
            imageURL = eventsArr[i].image.medium.url;
          }

          events.push({name: eventsArr[i].title,
                       location: position,
                       address: address,
                       description: info,
                       url: eventsArr[i].url,
                       image: imageURL,
                       venue: eventsArr[i].venue_name,
                       startTime: eventsArr[i].start_time,
                       stopTime: eventsArr[i].stop_time
                        })

          
        }

        console.log( events )

      });


});
