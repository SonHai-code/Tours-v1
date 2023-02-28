/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiamFjazVtIiwiYSI6ImNsODV3M3F6bDB1MmozdnA2Zm5ucmI3MjIifQ.CunhSu7Jv2-04vOhSrSfxw';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    scrollZoom: false,
  });

  // Create LngLatBounds() object
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    // Create Marker
    // 1) Create a 'div' element with class name 'marker'
    const el = document.createElement('div');
    el.className = 'marker';

    // Add the Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', // Add the 'el' element to the bottom of the variable 'map'
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add the pop-up
    new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: true,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // Extend the map bounds to include current location
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
