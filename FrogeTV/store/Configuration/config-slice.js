import { createSlice } from "@reduxjs/toolkit";
import { Dimensions } from "react-native";

const configSlice = createSlice({
    name: 'configSlice',
    initialState: {
        chatScrollAnimationIsActive: false, // if true, chat will scroll to the bottom with slight animation when new messages arrive. Disables some optimizations.
        includeAtOnReplies: true, // likely to never be used 
        hideDeletedMessages: false,
        msgsDelay: 0, // unused, perhaps for future use
        attemptEmoteSync: false, // sync emote playback
        maxEmoteCacheSize: 1000, // max emotes in cache (this affects animated emotes only)
        forgiveCacheIndex: 2, // if index playback is withing this amount, reuse the emote already in cache, skipping the GIF encoding process.
        // badges
        showBTTVBadges: true,
        showFFZBadges: true,
        // 3rd party emotes
        showBTTVEmotes: true,
        showFFZEmotes: true,
        show7TVEmotes: true,
        // history
        ExploreHistory: [],
        // Picture in Picture Android
        pipRouteAndroid:{
            route: null,
            enabledOn: null,
            streamURL: null,
        }
    },
    reducers: {
        setChatScrollAnimationIsActive(state, action) {
            state.chatScrollAnimationIsActive = action.payload;
        },
        setIncludeAtOnReplies(state, action) {
            state.includeAtOnReplies = action.payload;
        },
        setHideDeletedMessages(state, action) {
            state.hideDeletedMessages = action.payload;
        },
        setAttemptEmoteSync(state, action) {
            state.attemptEmoteSync = action.payload;
        },
        setMaxEmoteCacheSize(state, action) {
            state.maxEmoteCacheSize = action.payload;
        },
        setForgiveCacheIndex(state, action) {
            state.forgiveCacheIndex = action.payload;
        },
        // ExploreHistory saved
        setExploreHistory(state, action) {
            state.ExploreHistory = action.payload;
        },
        appendExploreHistory(state, action) {
            // Ensure that ExploreHistory is defined as an array.
            if (!Array.isArray(state.ExploreHistory)) {
                state.ExploreHistory = [];
            }
            state.ExploreHistory.unshift(action.payload);
            // Limit the ExploreHistory array to 5 items.
            if (state.ExploreHistory.length > 5) {
                state.ExploreHistory = state.ExploreHistory.slice(0, 5);
            }
        },
        removeExploreHistory(state, action) {
            // Ensure that ExploreHistory is defined as an array.
            if (!Array.isArray(state.ExploreHistory)) {
                state.ExploreHistory = [];
            }
            state.ExploreHistory = state.ExploreHistory.filter(item => item !== action.payload);
        },
        setMsgsDelay(state, action) {
            state.msgsDelay = action.payload;
        },
        setShowBTTVBadges(state, action) {
            state.showBTTVBadges = action.payload;
        },
        setShowFFZBadges(state, action) {
            state.showFFZBadges = action.payload;
        },
        setShowBTTVEmotes(state, action) {
            state.showBTTVEmotes = action.payload;
        },
        setShowFFZEmotes(state, action) {
            state.showFFZEmotes = action.payload;
        },
        setShow7TVEmotes(state, action) {
            state.show7TVEmotes = action.payload;
        },
        setPipRouteAndroid(state, action) {
            state.pipRouteAndroid = action.payload;
        },
        setPipAndroidEnabledOn(state, action) {
            state.pipRouteAndroid.enabledOn = action.payload;
        }

    },
});

export const configSliceActions = configSlice.actions;
export default configSlice.reducer;