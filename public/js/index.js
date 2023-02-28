/* eslint-disable*/
import { login, logout } from './login';
import { displayMap } from './mapbox';
import '@babel/polyfill';

// Make sure if there was not a map available - DOM ELEMENTs
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// Get locations from the HTML file
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  // Add submit event listener to form
  // querySelector select the first element that matches specific CSS selectors
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default from submit behavior
    // Get email and password information from user's input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
