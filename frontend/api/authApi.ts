import axios from 'axios';
import {User} from "@/types/auth"
import { getAppSettings } from '@/config';

const { URL_backend} = getAppSettings();

const API = axios.create({ baseURL: `${URL_backend}/auth` });
// Endpoints
async function loginUser(loginData: {email: string, password: string}){
    console.log("whole path:", `${URL_backend}/auth`)
    try {
        const response = await API.post('/login', loginData);
        if (response.data.success){
            console.log(response.data)
            return {success: true, message: "login-true", user: response.data.user}
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('Error Response:', error.response?.data.message );
            console.log('error status: ', error.response?.status)
            if (error.response?.status == 401){
                console.log("login failed")
                return {success: false, message: error.response?.data.message}
            }
        } else {
            console.error('Unknown Error:', error);
        }
    }

};

async function logoutUser(id: Number){

    try {
        const response = await API.post('/logout', {id});
        if (response.data){
            return {success: response.data.success, message: response.data.message}
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('Error Response:', error.response?.data.message );
            console.log('error status: ', error.response?.status)
            if (error.response?.status == 401){
                console.log("logout failed")
                return {message: "logout-false"}
            }
        } else {
            console.error('Unknown Error:', error);
        }
    }

};

async function registerUser(registerData: User) {
    try {
        const response = await API.post('/auth/signup', registerData);
        if (response.data.success) {
            console.log('User and settings created successfully:', response.data.user);
            return { message: "register-true", user: response.data.user };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error Response:', error.response?.data.message);
            console.error('Error status:', error.response?.status);
            if (error.response?.status === 401) {
                return { message: "register-false" };
            }
        } else {
            console.error('Unknown Error:', error);
        }
    }
    return { message: "Unknown error" };
}


export {registerUser, loginUser, logoutUser}