import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
    try {
        const response = await axios.post('/api/v1/users/login', {
            email,
            password,
        });
        const data = response.data;
        showAlert('success', 'User logged in succesfully');
        location.assign('/');
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message;
        showAlert('error', message);
    }
};

export const logout = async () => {
    try {
        await axios.get('/api/v1/users/logout');
        showAlert('success', 'Logged out succesfully');
        location.reload(true);
    } catch (error) {
        showAlert('error', 'Error in logging out, try again!');
    }
};
