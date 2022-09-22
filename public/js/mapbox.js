/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations); // locations now is a array of object location
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiamFjazVtIiwiYSI6ImNsODV3M3F6bDB1MmozdnA2Zm5ucmI3MjIifQ.CunhSu7Jv2-04vOhSrSfxw';
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jack5m/cl87eo492000w15qmma21uxlw',
  scrollZoom: false,

  // center: [34.111745, -34.111365],
  // zoom: 10,
  // interactive: false,
});

// Create bounds object
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create Marker
  // 1) Create a 'div' element with class name 'marker'
  const el = document.createElement('div');
  el.className = 'marker';

  // Add the Marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom', // Add the 'el' element to the bottom of the variable 'map'
  })
    .setLngLat(loc.coordinates)
    .addTo(map); 

  // Add the pop-up
  new mapboxgl.Popup({
    offset: 25,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`) 
    .addTo(map);

  // Extend the map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
