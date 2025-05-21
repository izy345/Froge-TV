import { createSlice } from "@reduxjs/toolkit";
import { Dimensions } from "react-native";

const userDetailsModalSlice = createSlice({
    name: 'userDetailsModalSlice',
    initialState: {
        showUserDetailsModal: false,
        selectedUserMsg: {},
        userDetails: {},
        
    },
    reducers: {
        setShowUserDetailsModal(state, action) {
            state.showUserDetailsModal = action.payload;
        },
        setSelectedUserMsg(state, action) {
            state.selectedUserMsg = action.payload;
        },
        setUserDetails(state, action) {
            state.userDetails = action.payload;
        },
        
    },
});

export const userDetailsModalSliceActions = userDetailsModalSlice.actions;
export default userDetailsModalSlice.reducer;