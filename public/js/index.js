/* eslint-disable*/
import { login, logout } from './login';
import { displayMap } from './mapbox';
import '@babel/polyfill';
import { updateSettings } from './updateSettings';

// Make sure if there was not a map available - DOM ELEMENTs
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

const userDataForm = document.querySelector('.form-user-data');
const passwordDataForm = document.querySelector('.form-user-password');

// Get locations from the HTML file
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// ADDING EVENT FOR THE BUTTONS

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

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    console.log('Form Before send to sever');
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

if (passwordDataForm)
  passwordDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

// if (passwordDataForm)
//   passwordDataForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     document.querySelector('.btn--save-password').textContent = 'Updating...';
//     const form = new FormData();
//     form.append(
//       'passwordCurrent',
//       document.getElementById('password-current').value
//     );
//     form.append('password', document.getElementById('password').value);
//     form.append(
//       'passwordConfirm',
//       document.getElementById('password-confirm').value
//     );
//     await updateSettings(form, 'password');
//     document.querySelector('.btn--save-password').textContent = 'Save Setting';
//     document.getElementById('password-current').value = '';
//     document.getElementById('password').value = '';
//     document.getElementById('password-confirm').value = '';
//   });
