import { createSlice } from "@reduxjs/toolkit";
import { Dimensions } from "react-native";

const searchSlice = createSlice({
    name: 'searchSlice',
    initialState: {
        renderCategory: true,
        // Categories
        gameCategoryList: [],
        // Categories/Streams
        streamCategoryList: [],
        // LiveChannels
        liveChannelsList: [],
        // Search
        searchVar: '',
        searchResultStreams: [],
        searchResultCategories: [],

        
    },
    reducers: {
        setRenderCategory(state, action) {
            state.renderCategory = action.payload;
        },
        setGameCategoryList(state, action) {
            state.gameCategoryList = action.payload;
        },
        appendGameCategoryList(state, action) {
            // filter out items whose id already exists in gameCategoryList
            const newItems = action.payload.filter(
                newItem =>
                    !state.gameCategoryList.some(
                        existing => existing.id === newItem.id
                    )
            );
            state.gameCategoryList = state.gameCategoryList.concat(newItems);
        },
        setStreamCategoryList(state, action) {
            state.streamCategoryList = action.payload;
        },
        appendStreamCategoryList(state, action) {
            const newItems = action.payload.filter(newItem => 
                !state.streamCategoryList.some(existing => existing.id === newItem.id)
            );
            state.streamCategoryList = state.streamCategoryList.concat(newItems);
        },
        setLiveChannelsList(state, action) {
            state.liveChannelsList = action.payload;
        },
        appendLiveChannelsList(state, action) {
            const newItems = action.payload.filter(newItem => 
                !state.liveChannelsList.some(existing => existing.id === newItem.id)
            );
            state.liveChannelsList = state.liveChannelsList.concat(newItems);
        },
        setSearchVar(state, action) {
            state.searchVar = action.payload;
        },
        setSearchResultStreams(state, action) {
            state.searchResultStreams = action.payload;
        },
        setSearchResultCategories(state, action) {
            state.searchResultCategories = action.payload;
        }
    },
});

export const searchSliceActions = searchSlice.actions;
export default searchSlice.reducer;