import { createSlice } from "@reduxjs/toolkit";

const streamSlice = createSlice({
    name: 'streamSlice',
    initialState: {
        chatMsgsList: [],
        usersList: [],
        twitchBadges: [],
        twitchEmotes: [],
        localTwitchEmotes: [],
        BTTVEmotes: [],
        localBTTVEmotes: [],
        BTTVBadges: [],
        FFZBadges: [],
        FFZEmotes: [],
        localFFZEmotes: [],
        sevenTVEmotes: [],
        localSevenTVEmotes: [],
        safeStreamWidth: null,
        safeStreamHeight: null,
    },

    reducers: {
        setChatMsgsList(state, action) {
            state.chatMsgsList = action.payload;
        },
        setUsersList(state, action) {
            state.usersList = action.payload;
        },
        setTwitchBadges(state, action) {
            state.twitchBadges = action.payload;
        },
        addTwitchBadges(state, action) {
            state.twitchBadges.push(action.payload);
        },
        addChatMessage(state, action) {
            state.chatMsgsList.push(action.payload);
        },
        setTwitchEmotes(state, action) {
            state.twitchEmotes = action.payload;
        },
        setLocalTwitchEmotes(state, action) {
            state.localTwitchEmotes = action.payload;
        },
        addTwitchEmotes(state, action) {
            state.twitchEmotes.push(action.payload);
        },
        setBTTVEmotes(state, action) {
            state.BTTVEmotes = action.payload;
        },
        setLocalBTTVEmotes(state, action) {
            state.localBTTVEmotes = action.payload;
        },
        setBTTVBadges(state, action) {
            state.BTTVBadges = action.payload;
        },
        setFFZBadges(state, action) {
            state.FFZBadges = action.payload;
        },
        setFFZEmotes(state, action) {
            state.FFZEmotes = action.payload;
        },
        setLocalFFZEmotes(state, action) {
            state.localFFZEmotes = action.payload;
        },
        setSeventTVEmotes(state, action) {
            state.sevenTVEmotes = action.payload;
        },
        setLocalSevenTVEmotes(state, action) {
            state.localSevenTVEmotes = action.payload;
        },
        setSafeStreamWidth(state, action) {
            state.safeStreamWidth = action.payload;
        },
        setSafeStreamHeight(state, action) {
            state.safeStreamHeight = action.payload;
        },
    },
});

export const streamSliceActions = streamSlice.actions;
export default streamSlice.reducer;