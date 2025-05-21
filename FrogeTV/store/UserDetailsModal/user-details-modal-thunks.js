import { Alert } from 'react-native';
import { userDetailsModalSliceActions } from './user-details-modal-slice';
import request from '../../API';

const userDetailsModalActions = {}

userDetailsModalActions.getChatterInfo = (user_id) => {
    return async (dispatch, getState) => {
        try {
            const response = await request('get', `users`,{
                id: user_id

            });
            console.log("User Details: ", response.data.data[0]);
            dispatch(userDetailsModalSliceActions.setUserDetails(response.data.data[0]));
            return;
        } catch (error) {
            console.warn("Could not get recent chat msgs.", error);
        }
    };
};


export default userDetailsModalActions


