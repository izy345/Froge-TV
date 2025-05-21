import { createSlice } from "@reduxjs/toolkit";

const homeSlice = createSlice({
    name: 'homeSlice',
    initialState: {
        streamFollowList: [],
    },
    reducers: {
        setStreamFollowList(state, action) {
            state.streamFollowList = action.payload;
        },
        

        
    },
});

export const homeSliceActions = homeSlice.actions;
export default homeSlice.reducer;