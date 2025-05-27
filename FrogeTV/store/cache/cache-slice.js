import { createSlice } from "@reduxjs/toolkit";

const cacheSlice = createSlice({
    name: 'cacheSlice',
    initialState: {
        categoryCache: [],
        streamCardCache: [],
        emoteCache: [],

    },
    reducers: {
        // category cache
        addCategoryCache(state, action) {
            const payload = action.payload;
            if (!payload || !payload.categoryId || !payload.viewerCount) {
                throw new Error("Invalid payload: Must include 'categoryId' and 'url'");
            }
            state.categoryCache.push(payload);
        },
        setCategoryCache(state, action) {
            state.categoryCache = action.payload;
        },
        // stream card cache
        addStreamCardCache(state, action) {
            const payload = action.payload;
            if (!payload || !payload.streamId || !payload.profileImageUrl) {
                throw new Error("Invalid payload: Must include 'streamId' and 'thumbnailUrl'");
            }
            state.streamCardCache.push(payload);
        },
        setStreamCardCache(state, action) {
            state.streamCardCache = action.payload;
        },
        // emote cache
        addEmoteCache(state, action) {
            const {
            emoteId,
            emoteUrl,
            frameDurations,
            totalDuration,
            frameCount,
            frames, // optional: array of SkImage
            } = action.payload || {};
    
            if (!emoteId || !emoteUrl) throw new Error("Invalid emote cache payload");
    
            const existing = state.emoteCache.find((e) => e.emoteId === emoteId);
            if (existing) return;
    
            state.emoteCache.push({
            emoteId,
            emoteUrl,
            frameDurations,
            totalDuration,
            frameCount,
            frames,
            });
        },
        setEmoteCache(state, action) {
            state.emoteCache = action.payload;
        },
    }
});

// get category URL by categoryId
export const getCategoryViewerCount = (categoryId) => (state) => {
    const entry = state.cache.categoryCache.find(item => item.categoryId === categoryId);
    return entry ? entry.viewerCount : null;
};
// get stream card profile URL by streamId
export const getStreamCardURL = (streamId) => (state) => {
    const entry = state.cache.streamCardCache.find(item => item.streamId === streamId);
    return entry ? entry.profileImageUrl : null;
};

// get emote data by emoteURL
export const getEmoteData = (emoteId) => (state) =>
    state.cache.emoteCache.find((e) => e.emoteId === emoteId) ?? null;

export const cacheSliceActions = cacheSlice.actions;
export default cacheSlice.reducer;