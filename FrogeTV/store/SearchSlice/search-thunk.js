import { Alert } from 'react-native';
import request from '../../API';
import { searchSliceActions } from './search-slice';
import { cacheSliceActions } from '../cache/cache-slice';

const searchActions = {}

searchActions.getTopGameCategories = (cursor) => {
    return async (dispatch, getState) => {
        try {;
            // If a cursor is provided, pass it as the third argument.
            const options = cursor ? {
                after: cursor,
                first: 35
            } : {
                first: 35
            };
            const response = await request('get', 'games/top', options);
            const data = response.data; 
            //console.log("Top Game Categories:", data.data);

            if (cursor) {
                dispatch(searchSliceActions.appendGameCategoryList(data.data));
            } else {
                dispatch(cacheSliceActions.setCategoryCache([]));
                dispatch(searchSliceActions.setGameCategoryList(data.data));
            }
            //console.log('[dispatch]',data.pagination.cursor);
            return data.pagination.cursor ?? null; // return the cursor for further pagination 
        } catch (error) {
            console.warn("Could not get game categories", error);
        }
    };
};

function logarithmicRegression(x, y) {
    const n = x.length;
    let sumLogX = 0, sumLogX2 = 0, sumY = 0, sumYLogX = 0;

    for (let i = 0; i < n; i++) {
        const logX = Math.log(x[i]);
        sumLogX += logX;
        sumLogX2 += logX * logX;
        sumY += y[i];
        sumYLogX += y[i] * logX;
    }

    // Calculate slope (B) and intercept (A)
    const B = (n * sumYLogX - sumLogX * sumY) / (n * sumLogX2 - sumLogX * sumLogX);
    const A = (sumY - B * sumLogX) / n;

    return { A, B };
}

searchActions.getEstiamtedViewersInCategory = (game_id) => {
    return async (dispatch, getState) => {
        try {
            let totalViewerCount = 0;
            let cursor = null;
            const maxPages = 1; // Fetch up to 100 streams (1 page)
            let topStreams = [];

            for (let page = 0; page < maxPages; page++) {
                const options = {
                    first: 100,
                    game_id,
                    ...(cursor && { after: cursor }),
                };
                const response = await request("get", "streams", options);
                const data = response.data.data;

                topStreams = topStreams.concat(data);
                totalViewerCount += data.reduce(
                    (sum, stream) => sum + stream.viewer_count,
                    0
                );

                // Get next page cursor.
                cursor = response.data.pagination.cursor;
                if (!cursor) break;
            }
            if (totalViewerCount < 10000) {
                return totalViewerCount
            }
            return totalViewerCount;
            // | | | debugging an alternative approach | | |
            // V V V                                   V V V
            if (topStreams.length === 0) {
                return 0;
            }

            // Create cumulative sums over the sorted streams.
            // We sort streams by viewer_count descending (should already be sorted).
            let cumulative = [];
            let cumSum = 0;
            for (let i = 0; i < topStreams.length; i++) {
                cumSum += topStreams[i].viewer_count;
                cumulative.push(cumSum);
            }

            // Create x values: 1, 2, ..., N.
            const xValues = cumulative.map((_, index) => index + 1);
            // yValues are cumulative sums.

            // Perform logarithmic regression:
            const { A, B } = logarithmicRegression(xValues, cumulative);
            // For instance, the model is: cumulativeSum = A + B * ln(rank)

            const extrapolatedRank =
                totalViewerCount > 200000
                    ? topStreams.length * 7.0
                    : totalViewerCount > 100000
                    ? topStreams.length * 1.7
                    : totalViewerCount > 50000
                    ? topStreams.length * 1.5
                    : topStreams.length * 1.2;
            
            const estimatedTotalViewerCount = Math.round(A + B * Math.log(extrapolatedRank));
            //console.log("length", topStreams.length, "extrapolatedRank", extrapolatedRank, "totalViewerCount", totalViewerCount, "\n estimatedTotalViewerCount", estimatedTotalViewerCount);
            return estimatedTotalViewerCount;

        } catch (error) {
            console.warn("Could not get number of viewers in this category", error);
        }
    };
};

searchActions.getStreamsfromCategories = (cursor, id) => {
    return async (dispatch, getState) => {
        try {;
            // If a cursor is provided, pass it as the third argument.
            const options = cursor ? {
                after: cursor,
                first: 35,
                game_id: id
            } : {
                first: 35,
                game_id: id
            };
            const response = await request('get', 'streams', options);
            const data = response.data; 
            //console.log("Games for this category:", data.data);

            if (cursor) {
                dispatch(searchSliceActions.appendStreamCategoryList(data.data));
            } else {
                dispatch(searchSliceActions.setStreamCategoryList(data.data));
            }
            //console.log('[dispatch]',data.pagination.cursor);
            return data.pagination.cursor; // return the cursor for further pagination 
        } catch (error) {
            console.warn("Could not get streams from categories", error);
        }
    };
};

searchActions.getLiveChannels = (cursor) => {
    return async (dispatch, getState) => {
        try {;
            // If a cursor is provided, pass it as the third argument.
            const options = cursor ? {
                after: cursor,
                first: 35,
            } : {
                first: 35,
            };
            const response = await request('get', 'streams', options);
            const data = response.data; 
            //console.log("Games for this category:", data.data);

            if (cursor) {
                dispatch(searchSliceActions.appendLiveChannelsList(data.data));
            } else {
                dispatch(searchSliceActions.setLiveChannelsList(data.data));
            }
            //console.log('[dispatch]',data.pagination.cursor);
            return data.pagination.cursor; // return the cursor for further pagination 
        } catch (error) {
            console.warn("Could not get streams from categories", error);
        }
    };
};

searchActions.getSearchQuery = (searchQuery) => {
    return async (dispatch, getState) => {
        try {
            // get streams
            const streamResponse = await request('get', 'search/channels', {
                query: searchQuery,
                first: 35,
            });
            let streamData = streamResponse.data.data;
            streamData.sort((a, b) => (a.is_live === b.is_live ? 0 : (a.is_live ? -1 : 1)));
            //console.log("Search Streams: ", streamData);
            // get categories
            const categoryResponse = await request('get', 'search/categories', {
                query: searchQuery,
                first: 25,
            });
            let categoryData = categoryResponse.data.data;

            dispatch(searchSliceActions.setSearchResultStreams(streamData));
            dispatch(searchSliceActions.setSearchResultCategories(categoryData));
        } catch (error) {
            console.warn("Could not get streams from categories", error);
        }
    };
};



export default searchActions


