import { createSlice } from "@reduxjs/toolkit";
import { Dimensions } from "react-native";

const chatInputSlice = createSlice({
    name: 'chatInputSlice',
    initialState: {
        chatInput: '',
        chatSuggestions: [],
        showEmoteList: false,
        isSubmitting: false,
        replyingTo: null,
    },
    reducers: {
        setChatInput(state, action) {
            state.chatInput = action.payload;
        },
        setChatSuggestions(state, action) {
            state.chatSuggestions = action.payload;
        },
        setShowEmoteList(state, action) {
            state.showEmoteList = action.payload;
        },
        setIsSubmitting(state, action) {
            state.isSubmitting = action.payload;
        },
        setReplyingTo(state, action) {
            state.replyingTo = action.payload;
        },
    },
});

export const chatInputSliceActions = chatInputSlice.actions;
export default chatInputSlice.reducer;