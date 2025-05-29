import { StyleSheet, View, SafeAreaView, StatusBar as SB, Platform } from "react-native";
import StreamFeed from "../../ui/StreamFeed";
import Chatbox from "../../components/Chatbox";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import EmoteDetailsModal from "../../ui/ChatStyling/EmoteModal";
import IOSKeyboardAvoidingView from "../../components/KeyboardAvoidingView";
import { useEffect, useMemo } from "react";
import { streamSliceActions } from "../../store/StreamSlice/stream-slice";
import UserDetailsModal from "../../ui/ChatInput/UserDetailsModal";
import { userDetailsModalSliceActions } from "../../store/UserDetailsModal/user-details-modal-slice";
import { emoteDetailsModalSliceActions } from "../../store/EmoteDetailsModal/emoteDetailsModal-slice";
import { useIsFocused } from "@react-navigation/native";
import { chatInputSliceActions } from "../../store/ChatInput/chatInput-slice";
import { __DEV__ } from "react-native";

function StreamScreen({ route, navigation }) {


    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const { width: deviceWidth, height: deviceHeight } = useSafeAreaFrame();
    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait);
    const { /*channelName*/ channelId, channelLogin } = route.params;

    const dynamicStyles = useMemo(() => {
        const videoWidth = !phoneIsPotrait 
            ? (Platform.OS === 'ios' && deviceWidth <= 875 ? deviceWidth * 0.60 : deviceWidth * 0.75)
            : 'auto';
        return {
            videoContainer: {
                width: deviceHeight > deviceWidth ? 'auto' : videoWidth,
                minHeight: 200,
                height: deviceHeight > deviceWidth ? 'auto': 'auto',
                aspectRatio: deviceHeight > deviceWidth ? 16 / 9 : null,
            },
        };
    }, [phoneIsPotrait, deviceWidth, deviceHeight]);

    useEffect( () => {
        dispatch(streamSliceActions.setSafeStreamWidth(deviceWidth));
        dispatch(streamSliceActions.setSafeStreamHeight(deviceHeight));
    },[deviceWidth])

    // Cleanup when leaving the screen
    useEffect( () => {
        return () => { 
            // close any open modals
            dispatch(userDetailsModalSliceActions.setShowUserDetailsModal(false))
            dispatch(emoteDetailsModalSliceActions.setEmoteDetailsModalVisible(false))
            // chat input cleanup
            dispatch(chatInputSliceActions.setChatInput(''))
            dispatch(chatInputSliceActions.setReplyingTo(null))
            dispatch(chatInputSliceActions.setShowEmoteList(false))
        }
    },[])

    return (
        <IOSKeyboardAvoidingView
            style ={{ flex: 1, flexGrow: 1, }}
            behavior={"padding"}
        >
            <SafeAreaView style={[!phoneIsPotrait ? styles.rootLandscape : styles.root]}>
                <View style={[styles.container, !phoneIsPotrait && styles.flexContainer]}>
                    <View style={dynamicStyles.videoContainer}>
                        <StreamFeed channelName={channelLogin} user_id={channelId} />
                    </View>
                        <Chatbox channelName={channelLogin} user_id={channelId} />
                </View>
                <EmoteDetailsModal
                    screenWidth={deviceWidth}
                />
                <UserDetailsModal
                    screenWidth={deviceWidth}
                />
            </SafeAreaView>
        </IOSKeyboardAvoidingView>
    );
}

export default StreamScreen;

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        paddingTop: Platform.OS === 'android' && !__DEV__ ? SB.currentHeight : 0,
    },
    rootLandscape:{
        flex: 1,
    },
    container: {
        flex: 1,
    },
    flexContainer: {
        flexDirection: "row",
    },
});