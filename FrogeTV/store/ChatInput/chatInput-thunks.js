import { Alert } from 'react-native';
import { chatInputSliceActions } from './chatInput-slice';
import request from '../../API';

const chatInputActions = {}

chatInputActions.sendTwitchChatMessage = (broadcasterId, replyParentMsgId) => {
    return async (dispatch, getState) => {
        try {
            const thisUserId = getState().auth.userId;
            const message = getState().chatInput.chatInput;
            if (message.trim() === '') {
                //console.warn("Message is empty.");
                return;
            }
            dispatch(chatInputSliceActions.setIsSubmitting(true));

            // Build the payload based on Twitch's API requirements.
            const payload = {
                broadcaster_id: broadcasterId,
                sender_id: thisUserId,
                message: message
            };

            // reply_parent_message_id is optional.
            if (replyParentMsgId) {
                payload.reply_parent_message_id = replyParentMsgId;
            }
            // Send POST request to Twitch chat messages endpoint.
            const response = await request('post', 'chat/messages', payload);
            console.log(response.data.data)
            if (response.data.data[0].is_sent === false) {
                Alert.alert("Message Not Sent", "Reason provided: " + response.data.data[0].drop_reason.message);
                dispatch(chatInputSliceActions.setIsSubmitting(false));
                return;
            }
            // result is successful, clear the chat input.
            dispatch(chatInputSliceActions.setChatInput(''));
            dispatch(chatInputSliceActions.setReplyingTo(null))
            dispatch(chatInputSliceActions.setIsSubmitting(false));
            // hiding the emote list if open in the actual component due to the animation.
            //dispatch(chatInputSliceActions.setShowEmoteList(false));
            return;
        } catch (error) {
            console.warn("Could not send Twitch chat message.", error);
            dispatch(chatInputSliceActions.setIsSubmitting(false));
            Alert.alert("Message Not Sent", "Could not send Twitch chat message");
        }
    };
};


export default chatInputActions


