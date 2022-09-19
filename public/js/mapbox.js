/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiamFjazVtIiwiYSI6ImNsODV3M3F6bDB1MmozdnA2Zm5ucmI3MjIifQ.CunhSu7Jv2-04vOhSrSfxw';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jack5m/cl87eo492000w15qmma21uxlw',
});
