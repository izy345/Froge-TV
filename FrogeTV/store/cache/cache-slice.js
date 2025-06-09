import { createSlice } from "@reduxjs/toolkit";
import EmoteGifEncoderModule from "../../modules/emote-gif-encoder/src/EmoteGifEncoderModule";


const cacheSlice = createSlice({
    name: 'cacheSlice',
    initialState: {
        categoryCache: [],
        streamCardCache: [],
        emoteCache: [],
        animationCache: []

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
                frames,
                base64Frames,
            } = action.payload || {};
        
            if (!emoteId || !emoteUrl) throw new Error("Invalid emote cache payload");
        
            const existing = state.emoteCache.find((e) => e.emoteId === emoteId);
            if (existing) return;
        
            // Remove the oldest emote if the cache size exceeds the limit
            if (state.emoteCache.length >= 125) {
                state.emoteCache.shift(); // Remove the first (oldest) emote
            }
        
            state.emoteCache.push({
                emoteId,
                emoteUrl,
                frameDurations,
                totalDuration,
                frameCount,
                frames,
                base64Frames,
            });
        },
        setEmoteCache(state, action) {
            state.emoteCache = action.payload;
        },
        // animated cache
        setAnimationCache(state, action) {
            state.animationCache = action.payload;
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

// set and/or get animation cache 
// helper mod function
const mod = (n, m) => ((n % m) + m) % m;

export const maybeEncodeAndAppendAnimationCache = 
    ({
        emoteUrl,
        timeIndex,
        base64Frames,
        frameDurations,
        totalNumberOfFrames,
        maxCacheSize = 1000,
        forgive = 0,
    }) => async (dispatch, getState) =>
    {
    const animationCache = getState().cache.animationCache;
    let newCache = [...animationCache];
    
    let emoteEntry = newCache.find(e => e.emoteUrl === emoteUrl);
    
    if (!emoteEntry) {
        emoteEntry = {
        emoteUrl,
        totalFrames: totalNumberOfFrames,
        lastUsed: Date.now(),
        frames: [],
        };
        newCache.unshift(emoteEntry);
    } else {
        emoteEntry.lastUsed = Date.now();
        newCache = [emoteEntry, ...newCache.filter(e => e !== emoteEntry)];
    }

    // Find matching frame
    let matchFrameIndex = emoteEntry.frames.findIndex(f => f.timeIndex === timeIndex);

    if (matchFrameIndex === -1 && forgive > 0) {
        for (let offset = -forgive; offset <= forgive; offset++) {
        const forgivingIndex = mod(timeIndex + offset, totalNumberOfFrames);
        matchFrameIndex = emoteEntry.frames.findIndex(f => f.timeIndex === forgivingIndex);
        if (matchFrameIndex !== -1) break;
        }
    }

    if (matchFrameIndex !== -1) {
        // Move frame to front and return cached base64
        const matchFrame = emoteEntry.frames.splice(matchFrameIndex, 1)[0];
        emoteEntry.frames.unshift(matchFrame);
        return { updatedCache: newCache, base64: matchFrame.base64 };
    }

    // NOT FOUND: encode entire emote to GIF base64 using native module
    const encodedBase64 = await EmoteGifEncoderModule.encodeGif(base64Frames, frameDurations);
    const base64 = `data:image/gif;base64,${encodedBase64}`;

    // Add new frame using encoded base64, NOT the original base64Frames[timeIndex]
    emoteEntry.frames.unshift({ timeIndex, base64 });

    // Prune cache
    const getWeight = e => e.totalFrames;
    let totalWeight = newCache.reduce((sum, e) => sum + getWeight(e), 0);

    while (totalWeight > maxCacheSize * 30) {
        const oldest = newCache.pop();
        totalWeight -= getWeight(oldest);
    }

    return { updatedCache: newCache, base64 };
}


export const cacheSliceActions = cacheSlice.actions;
export default cacheSlice.reducer;