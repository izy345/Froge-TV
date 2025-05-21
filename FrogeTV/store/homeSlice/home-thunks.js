import { Alert } from 'react-native';
import request from '../../API';
import { homeSliceActions } from './home-slice';

const homeActions = {};

homeActions.getStreamFromFollows = () => {
    return async (dispatch, getState) => {
        try {
            const thisUserId = getState().auth.userId;
            let streams = [];
            let cursor = null;
            do {
                const params = { user_id: thisUserId, first: 100 };
                if (cursor) params.after = cursor;
                const response = await request('get', 'streams/followed', params);
                if (response.status === 200) {
                    streams = streams.concat(response.data.data);
                    cursor = response.data.pagination?.cursor || null;
                } else {
                    Alert.alert('Error', 'Failed to fetch followed streams');
                    return;
                }
            } while (cursor);

            console.log('getStreamFromFollows response', streams);
            dispatch(homeSliceActions.setStreamFollowList(streams));
        } catch (error) {
            console.error('Error fetching followed streams:', error);
            Alert.alert('Error', 'Failed to fetch followed streams');
        }
    };
};

export default homeActions;