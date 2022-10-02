import { login, logout } from './login';
import { updateUser } from './updateUser';

// DOM
const loginForm = document.querySelector('.form--login');
const updatedUserForm = document.querySelector('.form-user-data');
const logoutBtn = document.querySelector('.nav__el--logout');

// VALUES

// DELEGATION
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login(email.value, password.value);
    });
}

if (logoutBtn) {
    console.log(logoutBtn);
    logoutBtn.addEventListener('click', () => {
        logout();
    });
}

if (updatedUserForm) {
    console.log('what is that');
    updatedUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('what is that');
        const data = new FormData();
        const name = updatedUserForm.name.value;
        const email = updatedUserForm.email.value;
        const photo = updatedUserForm.photo.files[0];
        data.append('name', name);
        data.append('email', email);
        data.append('photo', photo);
        console.log('hey');
        console.log(photo);

        updateUser(data);
    });
}
