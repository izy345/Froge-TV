import { createSlice } from "@reduxjs/toolkit";


const emoteDetailsModalSlice = createSlice({
    name: 'emoteDetailsModalSlice',
    initialState: {
        emoteDetailsModalVisible: false,
        emoteDetails: {},
        secondEmoteDetails: {},
    },

    reducers: {
        
        setEmoteDetailsModalVisible(state, action) {
            state.emoteDetailsModalVisible = action.payload;
        },
        setEmoteDetails(state, action) {
            state.emoteDetails = action.payload;
        },
        setSecondEmoteDetails(state, action) {
            state.secondEmoteDetails = action.payload;
        },
    },
});

export const emoteDetailsModalSliceActions = emoteDetailsModalSlice.actions;
export default emoteDetailsModalSlice.reducer;