import axios from 'axios';
import { authSliceActions } from '../store/AuthSlice/auth-slice';
import { store } from '../store';
//import { saveToken, getToken, deleteToken } from "../secure";

const BASE_URL = 'https://api.twitch.tv/helix/'
export const CLIENT_ID = 'rwnbtp0uxgh6pixldu20vafb069i35';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 30000,
});

const axiosInstanceURL = axios.create({
    baseURL: '',
    withCredentials: true,
    timeout: 10000,
});


// Variables to manage refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const { config, response } = error;
        if (response && response.status === 401) {
            // Mark this request to avoid infinite retry loops
            if (!config._retry) {
                config._retry = true;
                // If a refresh is already in process, queue the request
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        config.headers['Authorization'] = 'Bearer ' + token;
                        return axiosInstance(config);
                    }).catch(err => Promise.reject(err));
                }
                isRefreshing = true;
                console.log("Refreshing token...");
                // Open the CheckAuth modal by setting the login banner flag
                store.dispatch(authSliceActions.setShowLoginBanner(true));
                console.log("Waiting for user to login...");
                // Return a promise that waits for the token to update
                return new Promise((resolve, reject) => {
                    // Subscribe to store changes
                    const unsubscribe = store.subscribe(() => {
                        const state = store.getState();
                        // When the user logs in, the token and userId should be set
                        if (state.auth.access_token && state.auth.userId) {
                            unsubscribe();
                            processQueue(null, state.auth.access_token);
                            config.headers['Authorization'] = 'Bearer ' + state.auth.access_token;
                            resolve(axiosInstance(config));
                        }
                    });
                }).catch(err => {
                    processQueue(err, null);
                    return Promise.reject(err);
                }).finally(() => {
                    isRefreshing = false;
                });
            }
        }
        return Promise.reject(error);
    }
);


async function request(method, endpoint, data = {}){
    try {
        const accessToken = store.getState().auth.access_token ?? '';
        const headers = {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID,
        };

        let resp;
        if (method.toLowerCase() === 'delete') {
            resp = await axiosInstance.delete(endpoint, {
                data: data,
                headers: headers
            });
        } else if (method.toLowerCase() === 'get') {
            resp = await axiosInstance.request({
                method: method,
                url: endpoint,
                params: data, // Use 'params' for GET requests
                headers: headers
            });
        } else {
            resp = await axiosInstance.request({
                method: method,
                url: endpoint,
                data: data,
                headers: headers
            });
        }
        return { data: resp.data, status: resp.status };
    } catch (error) {
        console.warn("API: ",endpoint ,error);
        return { data: error.response?.data, status: error.response?.status };
    }
};

export default request

export async function requestURL(method, endpoint, data = {}){
    try {
        //const accessToken = store.getState().auth.access_token ?? '';
        const headers = {
            'Content-Type': 'application/json',
            //Authorization:  `Bearer ${accessToken}`,
            //'Client-Id': CLIENT_ID,
        };

        let resp;
        if (method.toLowerCase() === 'delete') {
            resp = await axiosInstanceURL.delete(endpoint, {
                data: data,
                headers: headers
            });
        } else if (method.toLowerCase() === 'get') {
            resp = await axiosInstanceURL.request({
                method: method,
                url: endpoint,
                params: data, // Use 'params' for GET requests
                headers: headers
            });
        } else {
            resp = await axiosInstanceURL.request({
                method: method,
                url: endpoint,
                data: data,
                headers: headers
            });
        }
        return { data: resp.data, status: resp.status };
    } catch (error) {
        console.warn('API: ',endpoint , error);
        return { data: error.response?.data, status: error.response?.status };
    }
};
