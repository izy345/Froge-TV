import { createSlice } from "@reduxjs/toolkit";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');


const phoneSlice = createSlice({
    name: 'phoneSlice',
    initialState: {
        phoneIsPotrait: height > width,
    },
    reducers: {
        setPhoneIsPotrait(state, action) {
            state.phoneIsPotrait = action.payload;
        },
    },
});

export const phoneSliceActions = phoneSlice.actions;
export default phoneSlice.reducer;