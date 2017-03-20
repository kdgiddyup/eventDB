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
                lngOffset = 0.5;
                latOffset = -0.2;
            } else {
                lngOffset = 0;
                latOffset = 0.2;
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
var pinColor = "da3838";
var context = {one:["Start time","Stop time", "More info", "Find out about tickets and prices here"],
                    two:["Average cost for two", "Overall user rating", "Types of food", "See photos and their menu here"]};
// function to add multiple markers from search response
function showEvents(resultData,controller) { 
    //controller is used to switch text in context object and pin color        
    pinColor = "da3838";
    var txt = context.one;
    if (controller === 1){
    pinColor = "1a7d1a";
    txt = context.two;
    }
    // resultData should be an array of event objects
    for (var i=0;i<resultData.length;i++) {
      var thisEvent = resultData[i];
            // does image exist? put some html around it
      if (thisEvent.image !== '')
          thisEvent.image = '<p><img class="infoWindowImg" src="'+thisEvent.image+'"/></p>';
      // create infoWindow
      var markerInfo = new google.maps.InfoWindow({
        //the txt variable allows us to reuse this function but with different text
        content: '<div class="infoWindow"><h2>'+thisEvent.name+'</h2>'+
            thisEvent.image+
            '<p><span class="leadin">Address:</span> '+thisEvent.address+'</p>'+
            '<p><span class="leadin">'+txt[0]+':</span> '+thisEvent.startTime+'</span></p>'+
            '<p><span class="leadin">'+txt[1]+':</span> '+thisEvent.stopTime+'</span></p>'+
            '<p><span class="leadin">'+txt[2]+':</span></p><p class="description">'+thisEvent.description+'</p>'+
            '<p><span class="info_link"><a href="'+thisEvent.url+'" target="_blank">'+txt[3]+'</a></p>'+'</div>'
          }); // end markerInfo object



// get position and add marker by geocoding the address string
      geocode(thisEvent.address,markerInfo);//line 111
    } // end results loop
} // end show events function

// pass a lat/lng object ('pos' argument) and infoWindow content ('markerInfo') to this function to place a clickable marker on the map
function addMarker(pos,windowInfo){
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: pinImage
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
    addMarker(response.results[0].geometry.location,info);//line 85
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
              };

          if( eventsArr[i].description === null){
            info = 'This is no information for this event.';
          }
          else{
            info = eventsArr[i].description;
          }
          if ( eventsArr[i].stop_time === null){
            eventsArr[i].stop_time = 'Not provided';
          }
          if( eventsArr[i].image === null ){
            imageURL = '';
          }
          else{
            imageURL = eventsArr[i].image.medium.url;
          }
         address = eventsArr[i].venue_address + ', ' + eventsArr[i].city_name + ', ' + eventsArr[i].region_abbr;

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
      }); // end api call

 });  // end test click function

//declared globally for passing into other functions
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
                            "address": results[i].restaurant.location.address, 
                            "startTime": results[i].restaurant.average_cost_for_two,
                            "stopTime": results[i].restaurant.user_rating.aggregate_rating,
                            "description":results[i].restaurant.cuisines,
                            "image":results[i].restaurant.thumb,
                            "url":results[i].restaurant.url,
                    }; //!a could grow depending on additional info that we need
                        restData.push(a);
                    } //ends for loop
                    console.log(restData);
                showEvents(restData, 1);
                }); //ends done function
        }); //ends restSearch function

}); // end doc ready