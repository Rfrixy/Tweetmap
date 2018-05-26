let locations,infowindow,poll_iteration=0,map;
let markers=[], locationMarker;
let poll_location_tag, center_tag;

$(document).ready(function(){
  initializeMap();
});

function pollCenter(){
  let center = map.getCenter();
  setLocationMarkerAndBeginPolling(center.lat(),center.lng());
}

function initializeMap(){
  locations = [];
  map = new google.maps.Map(document.getElementById('map_canvas'), {
    zoom: 10,
    center: new google.maps.LatLng(-33.92, 151.25),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  infowindow = new google.maps.InfoWindow();
  poll_location_tag = document.getElementById("coords");
  center_tag = document.getElementById("center");

  getLocation();
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;
  map = new google.maps.Map(document.getElementById('map_canvas'), {
    zoom: 15,
    center: new google.maps.LatLng( position.coords.latitude, position.coords.longitude),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  setLocationMarkerAndBeginPolling(lat,lng);
}

function setLocationMarkerAndBeginPolling(lat,lng){
  poll_iteration++;
  getTwitterData(lat,lng,poll_iteration,1);

  if(locationMarker){
    locationMarker.setMap(null);
  }

  let myLatLng = { lat:lat, lng:lng};
  locationMarker = new google.maps.Marker({
    position: new google.maps.LatLng(myLatLng),
    map: map,
  });

  google.maps.event.addListener(locationMarker, 'click', (function(locationMarker) {
    return function() {
      infowindow.setContent("<p style='padding:5px;'>Current polling location</p>");
      infowindow.open(map, locationMarker);
    }
  })(locationMarker));
  if(poll_iteration<=1){
    google.maps.event.addListener(map, 'center_changed', function() {

                   window.setTimeout(function() {
                     let latlng = map.getCenter();
                     center_tag.innerHTML = "Latitude: " + latlng.lat() +
                     "<br/>Longitude: " + latlng.lng();
                   }, 100);
               });
  }
}

function getTwitterData(lat,lng, iteration_num, firstcall){
  if(iteration_num!=poll_iteration){
    return;
  }

  if(firstcall){
    center_tag.innerHTML = "Latitude: " + lat +
    "<br/>Longitude: " + lng;
    document.getElementById("fetch").innerHTML="";
  }

  poll_location_tag.innerHTML = "Latitude: " + lat +
  "<br/>Longitude: " + lng;

  $.ajax({
      data: {},
      url: `/data/${lat}&${lng}`,
      dataType: 'json',
      success: function(data){
        setLocations(data);
        if(firstcall){
          // console.log("we found "+data.tweets.length+" tweets");
          document.getElementById("fetch").innerHTML="Found "+ data.tweets.length+" tweets around the current location";
        }
        setTimeout(()=>{
          getTwitterData(lat,lng,iteration_num,0);
        },3000);
     },
     error: function(data){
       console.log('got an error while polling');
       setTimeout(()=>{
         getTwitterData(lat,lng,iteration_num,0);
       },3000);
     }
   });
}


function setLocations(inp){
  if(inp.failed=="false"){
    inp.tweets.map( x=>{
      let tweetObj = { id:x.id, html:"<h3> data unavailable </h3>", lat:`${x.coords[1]}`,lon:`${x.coords[0]}`,img:`${x.img}`, screen_name:`${x.screen_name}`, id_str:`${x.id_str}`};
      checkAndAdd(tweetObj);
    } )
    checkAndTrim(100,10);
  }
  else{
    console.log("failed to poll");
  }
}

function checkAndAdd(obj) {
  var id = obj.id;
  var found = locations.some(function (el) {
    return el.id === id;
  });
  if (!found) {
    locations.push(obj);
    addMarker(obj);
  }
}

function checkAndTrim(maxlen,trimCount){
  if(trimCount>=maxlen){
    console.log("Why would you want me to chop off more elements than the array can hold, you math-less doofus?")
  }else{
    if(locations.length>=maxlen){
      locations = locations.splice(trimCount);
      deleteMarkers(trimCount);
    }
  }
}

function deleteMarkers(trimCount){
  for(let i=0;i<trimCount;i++){
    markers[i].setMap(null);
  }
  markers = markers.splice(trimCount);
}

function addMarker(locationObj){
  let myLatLng = { lat:parseFloat(locationObj.lat) + Math.random()*0.003, lng:parseFloat(locationObj.lon+Math.random() * 0.003)};
  let marker = new google.maps.Marker({
    position: new google.maps.LatLng(myLatLng),
    map: map,
    icon: `${locationObj.img}`
  });
  google.maps.event.addListener(marker, 'click', (function(marker) {
    return function() {
      infowindow.setContent("<p style='padding:5px;'>Loading data...</p>");
      infowindow.open(map, marker);
        // console.log('retrieving'+`/embed/${locationObj.screen_name}&${locationObj.id_str}`);
      $.ajax({
          data: {},
          url: `/embed/${locationObj.screen_name}&${locationObj.id_str}`,
          dataType: 'json',
          success: function(data){
            infowindow.setContent(data.html);
         }
       });
    }
  })(marker));
  markers.push(marker);
}
