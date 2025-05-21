import {useMemo} from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from "react-native";
import Colors from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { userDetailsModalSliceActions } from "../../store/UserDetailsModal/user-details-modal-slice";
import ChatStyling from "../ChatStyling";
import { chatInputSliceActions } from "../../store/ChatInput/chatInput-slice";
import * as Clipboard from 'expo-clipboard';


function UserDetailsModal({screenWidth}) {
    const dispatch = useDispatch();

    const showUserDetailsModal = useSelector((state) => state.userDetailsModal.showUserDetailsModal);
    const userChatData = useSelector((state) => state.userDetailsModal.selectedUserMsg);
    const userDetails = useSelector((state) => state.userDetailsModal.userDetails);

    //const chatInput = useSelector((state) => state.chatInput.chatInput);

    const onClose = () => {
        dispatch(userDetailsModalSliceActions.setSelectedUserMsg({}));
        dispatch(userDetailsModalSliceActions.setUserDetails({}));
        dispatch(userDetailsModalSliceActions.setShowUserDetailsModal(false));
    };

    const onCopyMessage = () => {
        Clipboard.setString(userChatData.message);
    };

    const onReply = () => {
        //dispatch(chatInputSliceActions.setChatInput("@" + userChatData.username + " " + chatInput));
        dispatch(chatInputSliceActions.setReplyingTo({
            id: userChatData.id,
            username: userChatData.username,
        }));
        onClose();
    }

    const dynamicStyles = useMemo(() => ({
        modalContainer: {
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.10)",
            width: screenWidth,
        },
    }), [screenWidth]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showUserDetailsModal}
            onRequestClose={onClose}
            supportedOrientations={["portrait", "landscape"]}
        >
            <View style={dynamicStyles.modalContainer}>
                <View style={styles.modalContent}>
                    {/*<View style={[styles.modalTopColor, {backgroundColor: userChatData.nameColor }]}/>*/}
                    <View>
                        
                    </View>
                    <View style={styles.modalHeader}>
                        <Image
                            source={{ uri: userDetails.profile_image_url }}
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                marginBottom: 10,
                            }}
                            contentFit="cover"
                        />
                        <Text style={[styles.modalTitle, {color: userChatData.nameColor}]}>   {userChatData.username}</Text>
                    </View>
                    {/* future plans: turn this into history map */}
                    <View style={styles.messageContainer} pointerEvents="none">
                        <ChatStyling
                            key={String(userChatData.id)}
                            user_id={userDetails.user_id || ""}
                            chatMsg={userChatData.message}
                            emotes={userChatData.allEmotes}
                            allowedEmotes={userChatData.emotes}
                            username={userChatData.username}
                            nameColor={userChatData.nameColor}
                            badges={userChatData.badges}
                            bttvBadges={userChatData.BTTVBadges}
                            FFZBadges={userChatData.FFZBadges}
                            type={userChatData.type}
                            deleted={userChatData.deleted}
                            replied={userChatData.replied}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={onReply}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Reply</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onCopyMessage}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Copy Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: Colors.twitchBlack950,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTopColor:{
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 4,
        marginBottom: 10,
    },
    modalHeader:{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors.twitchWhite1000,
    },
    closeButton: {
        alignSelf: "center",
        backgroundColor: Colors.twitchPurple1000,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    messageContainer:{
        padding: 10,
        borderRadius: 15,
        backgroundColor: Colors.twitchBlack1000,
    },
    buttonContainer:{
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 10,
    }
});

export default UserDetailsModal;
