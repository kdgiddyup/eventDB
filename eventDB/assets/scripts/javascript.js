// Initialize Firebase
var config = {
  apiKey: "AIzaSyCe2CvvyFRm7x0TWIx4N3KFwWO5nvAidGE",
  authDomain: "eventdb-7bc25.firebaseapp.com",
  databaseURL: "https://eventdb-7bc25.firebaseio.com",
  storageBucket: "eventdb-7bc25.appspot.com",
  messagingSenderId: "391210280123"
};

firebase.initializeApp(config);

var db = firebase.database();


window.onload = function() {
      gm = google.maps;
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

      oms = new OverlappingMarkerSpiderfier(map,
                  {markersWontMove: true, markersWontHide: true, keepSpiderfied: true});

        // add click event to marker to open info window
      infowindow = new google.maps.InfoWindow({
          maxWidth: 300
        });
      iw = infowindow;
      

     // we want to attempt to center the map at the user's present location
      // Try HTML5 geolocation.
      // First, set default position (City Market, Savannah)
      userPos = { 
        lat: 32.080816,
        lng:-81.094950 
      };
      // userPos isn't exactly where we want map centered, since we need space for an interface; on wider screens, offset longitude to push map to right
      if (window.innerWidth > 1000) {
          var lngOffset = 0;
          var latOffset = -.1;
      } else {
          var lngOffset = .1;
          var latOffset = -.1;
      }
      mapCenter = {
          lat: userPos.lat + latOffset,
          lng: userPos.lng - lngOffset
        }
     // now, if we geolocate, we can override the default position
      if (navigator.geolocation) {

          navigator.geolocation.getCurrentPosition(function(position) {
              // create geolocation object of user's position
              userPos.lat = position.coords.latitude;
              userPos.lng = position.coords.longitude;
              
              // calculate new map center
              mapCenter = {
                lat: userPos.lat + latOffset,
                lng: userPos.lng + lngOffset
              } 
              // update map object with new center location
              map.setCenter(mapCenter);
          }, handleLocationError         
        )
      }
      else {
          // Browser doesn't support Geolocation
          map.setCenter(mapCenter);
          console.log('Browser doesn\'t support Geolocation')
      }

  }//end window.onload

// handle errors that occur during attempted browser geolocation
function handleLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied geolocation.");
            map.setCenter(mapCenter);
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
}

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


    // resultData should be an array of event objects
    for (var i=0;i<resultData.length;i++) {
      var thisEvent = resultData[i];
            // does image exist? put some html around it
      if (thisEvent.image !== '')
          thisEvent.image = '<p><img class="infoWindowImg" src="'+thisEvent.image+'"/></p>';
      // create infoWindow
      if (thisEvent.stopTime == 'Not provided'){
            var markerInfo = '<div class="infoWindow"><h2>'+thisEvent.name+'</h2>'+
              thisEvent.image+
              '<p><h3> '+thisEvent.venue+'</h3></p>'+
              '<p><span class="leadin">Address:</span> '+thisEvent.address+'</p>'+
              '<p><span class="leadin">Start time:</span> '+thisEvent.startTime+'</span></p>'+
              thisEvent.description+
              '<p><span class="info_link"><a href="'+thisEvent.url+'" target="_blank">More info and tickets</a></p>'+
              '</div>'; // end markerInfo
      }
      else{
            var markerInfo = '<div class="infoWindow"><h2>'+thisEvent.name+'</h2>'+
              thisEvent.image+
              '<p><h3> '+thisEvent.venue+'</h3></p>'+
              '<p><span class="leadin">Address:</span> '+thisEvent.address+'</p>'+
              '<p><span class="leadin">Start time:</span> '+thisEvent.startTime+'</span></p>'+
              '<p><span class="leadin">Stop time:</span> '+thisEvent.stopTime+'</span></p>'+
              thisEvent.description+
              '<p><span class="info_link"><a href="'+thisEvent.url+'" target="_blank">More info and tickets</a></p>'+
              '</div>'; // end markerInfo
      }


    // get position and add marker by geocoding the address string; also pass the eventLocation array to receive the marker once created
    geocode (thisEvent.address, markerInfo, eventMarkers, type);
   
   // display events in HTML
    var eventBlock = $("<div>").addClass('outputBlock');
    $(eventBlock).append("<h3>"+thisEvent.name+"</h3>"+"<p>"+thisEvent.venue+"</p>"+"<p>"+thisEvent.address+"</p><p>Starts: "+thisEvent.startTime+"</p><p>Ends: "+thisEvent.stopTime+"</p><p><a href=\""+thisEvent.url+" target=\"_blank\">More information</a></p>");
      
    $("#eventOutput").append(eventBlock);
    } // end results loop

    // add a marker clusterer library t manage markers that are close together
    /*  we might not use this; let's comment it out for now
    var markerCluster = new MarkerClusterer(map, eventMarkers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    */


} // end showEvents function

function showRestaurants(resultData) { 
    // if there are restaurant markers, clear them
    clearMarkers(restaurantMarkers);
    
    // clear restaurant output area and restore header
    $("#restOutput").empty().append("<h2>Dining</h2>");

    // reset restaurant markers array
    
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
    geocode( thisRestaurant.location, markerInfo, restaurantMarkers, type);


    // display restaurants in HTML
    var restBlock = $("<div>").addClass('outputBlock');
    $(restBlock).append("<h3>"+thisRestaurant.name+"</h3><p>"+thisRestaurant.location+"</p><p>Average cost: $"+thisRestaurant.cost+"</p>"+thisRestaurant.menu);
      
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

      //spiderfier event listeners
      oms.addListener('click', function(marker) {
        iw.setContent(marker.desc);
        iw.open(map, marker);
      });

      google.maps.event.addListener(map, "click", function(event) {
          infowindow.close();
      });      
    // add marker to marker array
    _markers.push(marker);
    
    marker.desc = windowInfo;
    oms.addMarker(marker);
  }

// gets stringy address, returns {lat,lng} object in latLngCallback function
function geocode( address,info,markerArray,type ){

  // API call to google geocoding service - takes address (encoded) and api key
  var urlQuery = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURI(address)+'&key=AIzaSyAmK1XtRt48lGcJC9249vs6gGmNAelrFpQ';
  $.ajax({
    url: urlQuery,
    method: 'GET'
  }).done(function(response){
    // using callback to assign marker object to markerCallback
    addMarker( response.results[0].geometry.location, info, markerArray, type );
  }); // end ajax done function
}

//makes the API call for event data, then calls the function to place them on the map
function getEventData(eventKeyWord, where, radius, when) {
    var oArgs = {

        app_key: 'GRMfQ3CqpWsGdfXM',

        q: eventKeyWord,

        where: where,

        within: radius,

        date: when+'-'+when,

        page_size: 15,

        sort_order: "popularity",

        change_multi_day_start: true,

    };

    let events = [];


    EVDB.API.call("/events/search", oArgs, function(oData) {

        let name, info;
        let address = '';
        let eventsArr = oData.events.event;


        for (var i in eventsArr) {

              if( eventsArr[i].description === null){
                info = '<p class="description">There is no information for this event.</p>' ;
              }
              else if (eventsArr[i].description.length > 250){
                //console.log(eventsArr[i].title+ ' Desc:' +  eventsArr[i].description) ;
                
                info = '<div class="description">' +
                          '<div class="more">' + eventsArr[i].description + '</div>' +
                          '<div class="toggle-div"><span class="toggle-btn"> More>>></span></div>' +
                        '</div>';
                
                // console.log(eventsArr[i].title + " teaser is: " + eventsArr[i].description.substring(0, 250))
                // console.log(eventsArr[i].description.substring(0, 250).length)
               }
              else{
                info = '<p class="description">' + eventsArr[i].description + '</p>' ;
              }

              if ( eventsArr[i].stop_time === null){
                stopTime = 'Not provided';
              }
              else{
                stopTime = moment(new Date(eventsArr[i].stop_time)).format('dddd, MMMM Do, h:mm a') ;
              }

              if( eventsArr[i].image === null ){
                imageURL = '';
              }
              else{
                imageURL = eventsArr[i].image.medium.url;
              }

             address = eventsArr[i].venue_address + ', ' + eventsArr[i].city_name + ', ' + eventsArr[i].region_abbr;
              console.log(eventsArr[i].title + ' address: ' + address);
              events.push({
                    name: eventsArr[i].title,
                    address: address,
                    description: info,
                    url: eventsArr[i].url,
                    image: imageURL,
                    venue: eventsArr[i].venue_name,
                    startTime: moment(new Date(eventsArr[i].start_time)).format('dddd, MMMM Do, h:mm a'),
                    stopTime: stopTime
                });


        } // end for loop

      showEvents(events);
    }); // end api call
}//end getEventData function

//makes the API call for restaurant data, then calls the function to place them on the map
function getRestaurantData(keyWord, lat, long, radius ) {
  // restaurant ajax call from P. Hussey
    // adapted by K. Davis to get restaurants close to user geolocation
    var restData = [];
    // console.log(keyWord); 
    var queryURL = "https://developers.zomato.com/api/v2.1/search?q="+ keyWord +"&count=15&lat="+ lat +"&lon="+ long +"&radius="+radius+"sort=cost&order=asc";
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
            let results = response.restaurants;
            //console.log(results);
            for (var i = 0; i < results.length; i++) {

                var a = {
                    name: results[i].restaurant.name,
                    location: results[i].restaurant.location.address,
                    cost: results[i].restaurant.average_cost_for_two,
                    menu: results[i].restaurant.menu_url
                }; //!a could grow depending on additional info that we need
                console.log("Restaurant address+ " + a.location);
                restData.push(a);
            } //ends for loop
            showRestaurants(restData);
            //console.log(restData);
      }); //ends done function
}//end getRestaurantData function

//retrieves user input, adds it to the map and to firebase
function searchUserInput(){
      //prevent default form submit action
      event.preventDefault();

      // get search radius value
      var radius = String( $("#radiusSelect").val() );
      //console.log('radius: '+radius);

      //search input values
      var keyWord = $(".restSearch").val();
      var eventKeyWord = $(".eventSearch").val();

      //sets search location based on user lat and long
      var where = userPos.lat+','+userPos.lng;
      //formats date for event api call
      var when = $("#inputDate").val().replace(/-/g,'')+'00';
      //populates map with user's events search
      getEventData( eventKeyWord, where, radius, when);
      //populates map with user's restaurants search
      getRestaurantData(keyWord, userPos.lat, userPos.lng, radius);  
      //console.log(when);

      //gets user name for firebase tracking
      var user = $('#userName').val().trim();
      if( user == ''){
        //if no name entered, call them Anonymous with a random number between 0 and 1023
        user = 'Anonymous' + Math.floor( Math.random() * 1024 );
      }
      //blanks out userName field
      $('#userName').val('');

      //adds user search data to firebase so other connected users can see it
      db.ref( user ).set({lat: userPos.lat, 
                          long: userPos.lng, 
                          radius: radius, 
                          eventSearch: eventKeyWord, 
                          restSearch: keyWord, 
                          date: when
                          }).then(function() {
                            //after data added to firebase, sets this user as current-user for highlighting
                            //change previously selected user to not selected
                            let currSelection = $('[current-user="yes"')
                            currSelection.attr('current-user', 'no')
                            //set new user as currently selected
                            $('#' + user).attr('current-user', 'yes');
                            //adds listener to this user so it removes firebase data on disconnect
                            db.ref( user ).onDisconnect().remove(function(){
                            });
                          })
      console.log(user);
}//end searchUserInput function

// document ready statements here
$(document).ready(function(){

  // it will be necessary to  track markers in order to unset them so here're arrays to help with that
  eventMarkers = [];
  restaurantMarkers = [];
  //format today's date to ISO standard
  let tempDate = moment( new Date()).format('YYYY-MM-DD');
  //set default search date to today's date
  $('#inputDate').val(tempDate);

  //runs function to add user search inputs to map, and to firebase
  $("#submitButton").on("click", searchUserInput );

}); // end doc ready

db.ref().on('child_added', function( childSnapshot ) {

  //create user name in user display section
  $('#users').append('<div class="user" current-user="no" id="' + childSnapshot.key + '">' + childSnapshot.key + '</div>');

  } , function( errorObject){
  console.log("Errors handled: " + errorObject.code);
});//end child added block


db.ref().on('child_removed', function( childSnapshot ) {
  //remove user data from the DOM when a child is removed from firebase
  $('#' + childSnapshot.key).remove(); 

  } , function( errorObject){
  console.log("Errors handled: " + errorObject.code);
}); //end child removed block

  

$(document).on('click', '.toggle-div', function(){
      if( $(this).children().text() == ' More>>>' ){ //show text and change toggle text to Less
          $(this).children().text(' <<<Less');
          $(this).siblings().css({'overflow': 'auto', 'height': 'auto'})
      } //end if block
      else{ //hide text and change toggle text to More
          $(this).children().text(' More>>>');
          $(this).siblings().css({'overflow': 'hidden', 'height': '100px'})
      } //end else blocl
});//end toggle click function

//when user name is clicked on, will set them as active user and show their search data
$(document).on('click', '.user', function(){
    //change currently selected user to not selected
    let currSelection = $('[current-user="yes"')
    currSelection.attr('current-user', 'no')
    //set selected user to selected attribute for highlighting purposes
    console.log("This user selected: " + $(this).attr('id') );
    $(this).attr('current-user', 'yes');
    //get user search data from firebase
    db.ref( $(this).attr('id') ).once('value').then(function(snapshot){
      let data = snapshot.val();
      let where = data.lat+','+data.long;
      //populate selected user's events on map
      getEventData( data.eventSearch, where, data.radius, data.date);
      //populate selected user's restaurants on map
      getRestaurantData(data.restSearch, data.lat, data.long, data.radius); 

    }) //end firebase call

}); //end .user click function