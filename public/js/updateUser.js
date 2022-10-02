import axios from 'axios';
import { showAlert } from './alert';

export const updateUser = async (data) => {
    console.log('inside update');
    const endpoint = '/api/v1/users/updateMe';
    try {
        const response = await axios.patch(endpoint, data);
        const user = response.data.data.user;
        document.querySelector('#nav__username').textContent =
            user.name.split(' ')[0];
        showAlert('success', 'user updated successfully');
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        showAlert('error', message);
    }
};
