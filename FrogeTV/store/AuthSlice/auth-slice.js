import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'authSlice',
    initialState: {
        isloggedIn: false,
        access_token: '',
        userId: '',
        userName: '',
        showLoginBanner: false
    },
    reducers: {
        setIsLoggedin(state, action) {
            state.isloggedIn = action.payload;
        },
        setAccessToken(state, action) {
            state.access_token = action.payload;
        },
        setUserId(state, action) {
            state.userId = action.payload;
        },
        setShowLoginBanner(state, action) {
            state.showLoginBanner = action.payload;
        },
        setUserName(state, action) {
            state.userName = action.payload;
        },
    },
});

export const authSliceActions = authSlice.actions;
export default authSlice.reducer;