/* eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

// Using axios - making HTTPs method to send POST request to the server
// Define login function
export const login = async (email, password) => {
  const baseURL = 'http://localhost:3000';
  const loginEndpoint = '/api/v1/users/login';

  console.log(email, password);
  // Sending post request
  try {
    const res = await axios({
      method: 'post',
      url: baseURL + loginEndpoint,
      data: {
        email,
        password,
      },
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': ['POST', 'GET', 'OPTIONS'],
        'x-api-key': 'abcdefghi',
        'Access-Control-Allow-Headers': ['X-PINGOTHER', 'Content-Type'],
      },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'You have loggined successfully!');

      // Reload the page after 1500 miliseconds to render the page after logged in
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  const baseURL = 'http://localhost:3000';
  const logoutEndpoint = '/api/v1/users/logout';

  try {
    const res = await axios({
      method: 'get',
      url: baseURL + logoutEndpoint,
    });

    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', 'Error Logging out! Try again.');
  }
};
