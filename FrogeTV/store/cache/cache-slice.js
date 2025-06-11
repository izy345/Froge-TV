import { createSlice } from "@reduxjs/toolkit";
import EmoteGifEncoderModule from "../../modules/emote-gif-encoder/src/EmoteGifEncoderModule";


const cacheSlice = createSlice({
    name: 'cacheSlice',
    initialState: {
        categoryCache: [],
        streamCardCache: [],
        emoteCache: [],
        animationCache: {
            map: {}, // key: emoteUrl, value: EmoteEntry
            order: [], // LRU list of emoteUrls
        }

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

export const maybeEncodeAndAppendAnimationCache = ({
    animationCache,
    emoteUrl,
    timeIndex,
    base64Frames,
    frameDurations,
    totalNumberOfFrames,
    maxCacheSize = 1000,
    forgive = 0,
}) => async (dispatch, getState) => {
    //const { animationCache } = getState().cache;

    // Use a mutable copy
    const map = { ...animationCache.map };
    const order = [...animationCache.order]; // LRU order of emoteUrls (most recent at front)

    let emoteEntry = map[emoteUrl];

    if (!emoteEntry) {
        emoteEntry = {
            emoteUrl,
            totalFrames: totalNumberOfFrames,
            frames: {},
        };
    } else {
        // Deep clone the object to make it mutable
        emoteEntry = {
            ...emoteEntry,
            frames: { ...emoteEntry.frames },
        };
    }

    // Replace or insert into the cache
    map[emoteUrl] = emoteEntry;

    // Update LRU order
    const idx = order.indexOf(emoteUrl);
    if (idx !== -1) order.splice(idx, 1);
    order.unshift(emoteUrl);

    // Check for cache hit
    let frameKey = timeIndex;
    let matchFrame = emoteEntry.frames[frameKey];

    if (!matchFrame && forgive > 0) {
        for (let offset = -forgive; offset <= forgive; offset++) {
            const forgivingKey = mod(timeIndex + offset, totalNumberOfFrames);
            if (emoteEntry.frames[forgivingKey]) {
                frameKey = forgivingKey;
                matchFrame = emoteEntry.frames[forgivingKey];
                break;
            }
        }
    }

    if (matchFrame) {
        // Hit: no need to modify frames; we don't LRU-sort them here
        dispatch(cacheSliceActions.setAnimationCache({ map, order }));
        return { updatedCache: { map, order }, base64: matchFrame.base64 };
    }

    // Miss: encode and insert
    const encodedBase64 = await EmoteGifEncoderModule.encodeGif(base64Frames, frameDurations);
    const base64 = `data:image/gif;base64,${encodedBase64}`;
    emoteEntry.frames[timeIndex] = { base64 };

    // Total weight calculation
    let totalWeight = 0;
    for (const url of order) {
        const entry = map[url];
        totalWeight += entry?.totalFrames || 0;
    }

    // Prune least recently used until within limits
    while (totalWeight > maxCacheSize * 30 && order.length > 0) {
        const oldestUrl = order.pop();
        const removed = map[oldestUrl];
        totalWeight -= removed?.totalFrames || 0;
        delete map[oldestUrl];
    }

    dispatch(cacheSliceActions.setAnimationCache({ map, order }));
    return { updatedCache: { map, order }, base64 };
};






export const cacheSliceActions = cacheSlice.actions;
export default cacheSlice.reducer;