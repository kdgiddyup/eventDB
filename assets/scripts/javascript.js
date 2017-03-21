// init map callback for google maps api
//removed ;
function initMap() {
    // create map object using google maps api method2
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DEFAULT,
          mapTypeIds: ['roadmap', 'terrain','hybrid','satellite']
          },
        fullscreenControl: true,
        styles: [
          {
            featureType: 'all',
            stylers: [
              { saturation: -80 }
            ]
          },
          {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
            { hue: '#00ffee' },
            { saturation: 50 }
          ]
          },
          {
          featureType: 'poi.business',
          elementType: 'labels',                                                                                  
          stylers: [
            { visibility: 'off' }                                                                                                                  
          ]
          }
          ] // end styles array

    }); // end initMap

      // add click event to marker to open info window
    infowindow = new google.maps.InfoWindow({
        maxWidth: 300
      });

   // we want to attempt to center the map at the user's present location
    // Try HTML5 geolocation.
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
            // create geolocation object of user's position
            userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // on wider screens, offset longitude to push map to right
            if (window.innerWidth > 1000) {
                var lngOffset = .2;
                var latOffset = -.1;
            } else {
                var lngOffset = .1;
                var latOffset = -.1;
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
/***** start of Patrick code *********

//starts adaptive coding
var pinColor = "da3838";
var context = {one:["Start time","Stop time", "More info", "Find out about tickets and prices here"],
                    two:["Average cost for two", "Overall user rating", "Types of food", "See photos and their menu here"]};
// function to add multiple markers from search response

******** end Patrick code block *******/
/**************************************/

// resultData will be array of objects in format:
// [{type: 'restaurant'|'event', name: '<name>', other response key-value pairs},{result2 object}, {result3 object}] 

function showEvents(resultData) { 
    // if there are event markers, clear them
    clearMarkers(eventMarkers);

    // clear events output area and restore header
    $("#eventOutput").empty().append("<h2>Events</h2>");
    
    // reset event markers array
    eventMarkers = [];
    
    // restaurant or event? determines marker color later
    var type = 'event';

/******** start of Patrick code *********/
/*
function showEvents(resultData,controller) { 
    //controller is used to switch text in context object and pin color        
    pinColor = "da3838";
    var txt = context.one;
    if (controller === 1){
    pinColor = "1a7d1a";
    txt = context.two;
    }
********** end of Patrick code block *******
*******************************************/
    // resultData should be an array of event objects
    for (var i=0;i<resultData.length;i++) {
      var thisEvent = resultData[i];
            // does image exist? put some html around it
      if (thisEvent.image !== '')
          thisEvent.image = '<p><img class="infoWindowImg" src="'+thisEvent.image+'"/></p>';
      // create infoWindow
      var markerInfo = '<div class="infoWindow"><h2>'+thisEvent.name+'</h2>'+
            thisEvent.image+
            '<p><span class="leadin">Address:</span> '+thisEvent.address+'</p>'+
            '<p><span class="leadin">Start time:</span> '+thisEvent.startTime+'</span></p>'+
            '<p><span class="leadin">Stop time:</span> '+thisEvent.stopTime+'</span></p>'+
            '<p><span class="leadin">More info:</span></p><p class="description">'+thisEvent.description+'</p>'+
            '<p><span class="info_link"><a href="'+thisEvent.url+'" target="_blank">More info and tickets</a></p>'+
            '</div>'; // end markerInfo

/********* alternative markerInfo option from Patrick *****
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
************************************************************/

// get position and add marker by geocoding the address string; also pass the eventLocation array to receive the marker once created
    geocode(thisEvent.address,markerInfo,eventMarkers, type);
   
   // display events in HTML
    var eventBlock = $("<div>").addClass('outputBlock');
    $(eventBlock).append("<h3>"+thisEvent.name+"</h3><p>"+thisEvent.address+"</p><p>Starts: "+thisEvent.startTime+"</p><p>Ends: "+thisEvent.stopTime+"</p><p><a href=\""+thisEvent.url+" target=\"_blank\">More information</a></p>");
      
    $("#eventOutput").append(eventBlock);

    } // end results loop

    // add a marker clusterer library t manage markers that are close together
    /*  we might not use this; let's comment it out for now
    var markerCluster = new MarkerClusterer(map, eventMarkers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    */

} // end show events function

function showRestaurants(resultData) { 
    // if there are restaurant markers, clear them
    clearMarkers(restaurantMarkers);
    
    // clear restaurant output area and restore header
    $("#restOutput").empty().append("<h2>Dining</h2>");

    // reset restaurant markers array
    restaurantMarkers = [];
    
    // is this event or restaurant? determines marker color later
    var type = 'restaurant';
    
    // resultData should be an array of restaurant objects
    for (var i=0;i<resultData.length;i++) {
      var thisRestaurant = resultData[i];

      // does menu exist? put some html around it, too
      if (thisRestaurant.menu != '')
          thisRestaurant.menu = '<p><span class="info_link"><a href="'+thisRestaurant.menu+'" target="_blank">Menu</a></p>';

      // create infoWindow
      var markerInfo = '<div class="infoWindow"><h2>'+thisRestaurant.name+'</h2>'+
            '<p><span class="leadin">Address:</span> '+thisRestaurant.location+'</p>'+
            '<p><span class="leadin">Average cost for two:</span> $'+thisRestaurant.cost+'</span></p>'+
           thisRestaurant.menu+
            '</div>'; // end markerInfo



// get position and add marker by geocoding the address string; also pass the eventLocation array to receive the marker once created
    geocode(thisRestaurant.location,markerInfo,restaurantMarkers, type);


    // display restaurants in HTML
    var restBlock = $("<div>").addClass('outputBlock');
    $(restBlock).append("<h3>"+thisRestaurant.name+"</h3><p>"+thisRestaurant.address+"</p><p>Average cost: $"+thisRestaurant.cost+"</p>"+thisRestaurant.menu);
      
    $("#restOutput").append(restBlock);

    } // end results loop
} // end showRestaurants function

function clearMarkers(markerArray){

  for (i=0;i<markerArray.length;i++){
    // markerArray[i] is a marker on the map; setting it to no map ('null') makes it vanish
    markerArray[i].setMap(null);
  }
}

function addMarker(pos,windowInfo,_markers,type){
    // type determines marker color here
    if (type == 'event') {
      markerColor='#17B27D';
      strokeColor='#54FFC4'
    }
    else {
      markerColor = '#B24329';
      strokeColor = '#FF896D'
    }
    // instanstiate a marker object
    var marker = new google.maps.Marker({
        position: pos,
        map: map,
        desc: windowInfo,
        animation: google.maps.Animation.DROP,
        icon: {                                          
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: markerColor,
          strokeColor: strokeColor,                       
          strokeWeight: 1,
          fillOpacity: 1
          } 
        });            
/******** alternative addMarker from Patrick *************
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
************************************************************/
    // clicking on marker opens info window
      marker.addListener('click', function() {
         // update infowindow content
        infowindow.setContent(marker.desc);
        infowindow.open(map, marker);
        });
    // add marker to marker array
    _markers.push(marker);
    
    marker.desc = windowInfo;
  }

// this code is straight from google API documentation, for handling errors that occur during attempted browser geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }


// gets stringy address, returns {lat,lng} object in latLngCallback function
function geocode(address,info,markerArray,type){
  // API call to google geocoding service - takes address (encoded) and api key
  var urlQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(address)+'&key=AIzaSyAmK1XtRt48lGcJC9249vs6gGmNAelrFpQ';
  $.ajax({
    url: urlQuery,
    method: 'GET'
  }).done(function(response){
    // using callback to assign marker object to markerCallback
    addMarker(response.results[0].geometry.location,info,markerArray,type);
  }); // end ajax done function
}

// document ready statements here
$(document).ready(function(){

// it will be necessary to  track markers in order to unset them so here're arrays to help with that
eventMarkers = [];
restaurantMarkers = [];

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
    $("#submitButton").on("click", function(event) {
        event.preventDefault();

        // check for required fields
        var inputs =[];
        
        // loop through inputs on the page
        $("input").each(function(){
          // remove any previously added 'blank' class; we add the 'blank' class to alert user a field must be filled in; 
          // if there are no blank classes, jquery will fail silently
          $(this).removeClass("blank");
          
          // add inputs to the inputs array
          inputs.push($(this))
        });

        // loop through array and check for required data attribute and blank values
        for (var i=0;i<inputs.length;i++){
          if ($(inputs[i]).attr("data-required")=="required") {
            if ($(inputs[i]).val()=="")
              $(inputs[i]).addClass("blank")
          }
        else {

          // event ajax stuff here from T. Dusterdieck
          // adapted by K Davis to get events close to geolocated position and date from input 
          var where = userPos.lat+','+userPos.lng;
          var when = $("#inputDate").val().replace(/-/g,'')+'00';
          
          console.log(when);
          var oArgs = {

            app_key: 'GRMfQ3CqpWsGdfXM',

            q: "",

            // to do: need an ajax call to get zip from geolocated lat/lng

            where: where,

            within: '10',

            date: when+'-'+when,

            page_size: 15,

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

// restaurant ajax call from P. Hussey
// adapted by K. Davis to get restaurants close to user geolocation
    var restData = [];
    var queryURL = "https://developers.zomato.com/api/v2.1/search?q=&count=15&lat="+userPos.lat+"&lon="+userPos.lng+"&sort=cost&order=asc";
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
            //console.log(results);
            for (var i = 0; i < results.length; i++) {
                var a = {
                    name: results[i].restaurant.name,
                    location: results[i].restaurant.location.address,
                    cost: results[i].restaurant.average_cost_for_two,
                    menu: results[i].restaurant.menu_url
                }; //!a could grow depending on additional info that we need
                restData.push(a);
            } //ends for loop
            showRestaurants(restData);
            //console.log(restData);
      }); //ends done function

        } // ends else statements for valid input           
      } // end input for loop
 });  // end submit click function

/********* test code from Patrick ****************
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
**************************************************/

}); // end doc ready