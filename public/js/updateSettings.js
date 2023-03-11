/*eslint-disable*/

// updateData

import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  const baseURL = 'http://localhost:3000';
  const updateEndpoint =
    type === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url: baseURL + updateEndpoint,
      data,
      withCredentials: true,
    });
    if (res.data.status === 'success') {
      showAlert('success', `Data was updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
