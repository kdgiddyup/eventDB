// init map callback for google maps api
function initMap() {
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
            } else {
                var lngOffset = 0;
                var latOffset = .2;
            }
            var mapCenter = {
                lat: position.coords.latitude + latOffset,
                lng: position.coords.longitude - lngOffset
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

function showEvents(resultData) { 

    // resultData should be an array of event objects
      console.log(resultData.length);
    for (var i=0;i<resultData.length;i++) {
      var thisEvent = resultData[i];
      
      // does image exist? put some html around it
      if (thisEvent.image != '')
          thisEvent.image = '<p><img class="infoWindowImg" src="'+thisEvent.image+'"/></p>';

      // create infoWindow
      var markerInfo = new google.maps.InfoWindow({
        content: '<div class="infoWindow"><h2>'+thisEvent.name+'</h2>'+
            thisEvent.image+
            '<p><span class="leadin">Address:</span> '+thisEvent.address+'</p>'+
            '<p><span class="leadin">Start time:</span> '+thisEvent.startTime+'</span></p>'+
            '<p><span class="leadin">Stop time:</span> '+thisEvent.stopTime+'</span></p>'+
            '<p><span class="leadin">More info:</span></p><p class="description">'+thisEvent.description+'</p>'+
            '<p><span class="info_link"><a href="'+thisEvent.url+'" target="_blank">More info and tickets</a></p>'+
            '</div>'
          }); // end markerInfo object



// get position and add marker by geocoding the address string
      geocode(thisEvent.address,markerInfo);
    } // end results loop
} // end show events function

// pass a lat/lng object ('pos' argument) and infoWindow content ('markerInfo') to this function to place a clickable marker on the map
function addMarker(pos,windowInfo){
    var marker = new google.maps.Marker({
        position: pos,
        map: map
    });
    // put listener on this marker to open the marker info in an infowindow
    marker.addListener('click', function() {
   	windowInfo.open(map, this);
  	});
  }

// this code is straight from google API documentation, for handling errors that occur during attempted browser geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }


// gets stringy address, returns {lat,lng} object in latLngCallback function
function geocode(address,info){
  // API call to google geocoding service - takes address (encoded) and api key
  var urlQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(address)+'&key=AIzaSyAmK1XtRt48lGcJC9249vs6gGmNAelrFpQ';
  $.ajax({
    url: urlQuery,
    method: 'GET'
  }).done(function(response){
    addMarker(response.results[0].geometry.location,info);
  });
}

// document ready statements here
$(document).ready(function(){

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

    $("#eventTester").on("click", function() {
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

    for (var i in eventsArr) {

          position = {
           lat: parseFloat(eventsArr[i].latitude),
            lng: parseFloat(eventsArr[i].longitude)
              }

          if( eventsArr[i].description == null){
            info = 'This is no information for this event.'
          }
          else{
            info = eventsArr[i].description
          }
          if ( eventsArr[i].stop_time == null){
            eventsArr[i].stop_time = 'Not provided'
          };
          if( eventsArr[i].image == null ){
            imageURL = '';
          }
          else{
            imageURL = eventsArr[i].image.medium.url;
          }
         address = eventsArr[i].venue_address + ', ' + eventsArr[i].city_name + ', ' + eventsArr[i].region_abbr;
                // console.log( position )
                // console.log( address )

          events.push({
                name: eventsArr[i].title,
                location: position,
                address: address,
                description: info,
                url: eventsArr[i].url,
                image: imageURL,
                venue: eventsArr[i].venue_name,
                startTime: eventsArr[i].start_time,
                stopTime: eventsArr[i].stop_time
            });


    } // end for loop
    showEvents(events);
    console.log(events);
      }); // end api call

 });  // end test click function

  var restData = [];

    $("#restTester").on("click",
        function restSearch() {
            var queryURL = "https://developers.zomato.com/api/v2.1/search?q=mexican&count=15&lat=32.039347819445&lon=-81.108557106944&sort=cost&order=asc";
            var key = "1d78eb50e1194c317037b03a6ab3118e";
            $.ajax({
                    url: queryURL,
                    method: "GET",
                    beforeSend: function(request) {
                        request.setRequestHeader("user-key", key);
                    },
                })
                .done(function(response) {
                    restData = [];
                    results = response.restaurants;
                    console.log(results);
                    for (var i = 0; i < results.length; i++) {
                        var a = {
                            "name": results[i].restaurant.name,
                            "location": results[i].restaurant.location.address,
                            "cost": results[i].restaurant.average_cost_for_two
                        }; //!a could grow depending on additional info that we need
                        restData.push(a);
                    } //ends for loop
                    console.log(restData);
                }); //ends done function
        }); //ends restSearch function

}); // end doc ready
