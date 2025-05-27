import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Animated, Text, ScrollView} from "react-native";
import IconButton from "../CustomIcons/IconButton";
import Colors from "../../constants";
import EmoteList from "./EmoteList";
import { useSelector, useDispatch } from "react-redux";
import { chatInputSliceActions } from "../../store/ChatInput/chatInput-slice";
import EmoteRecommendation from "./EmoteRecommendation";
import chatInputActions from "../../store/ChatInput/chatInput-thunks";
import Icon from "../CustomIcons";
import useKeyboardFocus from "../../utils/useKeyboardFocus";

function ChatInput({allEmotes, broadcasterId}) {

    const dispatch = useDispatch();

    const showEmoteList = useSelector((state) => state.chatInput.showEmoteList);
    const chatInput = useSelector((state) => state.chatInput.chatInput);
    const isSubmitting = useSelector((state) => state.chatInput.isSubmitting);
    const replyingTo = useSelector((state) => state.chatInput.replyingTo);

    const phoneIsPotrait = useSelector( (state) => state.phone.phoneIsPotrait);

    const [rootWidth, setRootWidth] = useState(0);

    const { isFocused, setIsFocused } = useKeyboardFocus();

    const textInputRef = useRef(null);

    const fadeAnimationRef = useRef(new Animated.Value(0)).current; // starts invisible
    const translateAnimationRef = useRef(new Animated.Value(50)).current; // starts 50px below

    const handleSubmit = useCallback(async () => {
        if (chatInput.trim() === '') {
            return;
        }
        await dispatch(chatInputActions.sendTwitchChatMessage(broadcasterId, replyingTo?.id))
        if (showEmoteList) {
            toggleEmoteList()
        }

    },[chatInput, dispatch, broadcasterId]);


    const toggleEmoteList = useCallback(() => {
        // animation for when it disappears
        if (showEmoteList) {
            Animated.parallel([
                Animated.timing(fadeAnimationRef, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateAnimationRef, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                dispatch(chatInputSliceActions.setShowEmoteList(false));
            });
            // animation for when it appears 
        } else {
            dispatch(chatInputSliceActions.setShowEmoteList(true));
            Animated.parallel([
                Animated.timing(fadeAnimationRef, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(translateAnimationRef, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showEmoteList, dispatch, fadeAnimationRef, translateAnimationRef]);

        const computedTranslateX = useMemo(() => {
            return (rootWidth - 289)
        }, [rootWidth]);

    return (
        <View
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setRootWidth(width);
            }}
        >
            { replyingTo !== null && (
                <View style={styles.replyContainer}>
                    <Icon
                        icon="arrow-redo-outline"
                        size={18}
                        color={Colors.twitchBlack700}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ marginHorizontal: 8 }}
                    >
                        <Text style={{ color: Colors.twitchWhite1000, flexShrink: 1 }}>
                            Replying to {replyingTo.username}
                        </Text>
                    </ScrollView>
                    <IconButton
                        icon="trash-outline"
                        size={16}
                        color={Colors.twitchBlack700}
                        onPress={() => {
                            dispatch(chatInputSliceActions.setReplyingTo(null));
                            dispatch(chatInputSliceActions.setChatInput(''));
                        }}
                    />
                </View>
            )}
            { chatInput !== '' &&
                <EmoteRecommendation
                    allEmotes={allEmotes}
                />
            }
                <View style={[styles.inputContainer, isFocused && !phoneIsPotrait &&  !showEmoteList && { minWidth: 289, transform: [{ translateX: computedTranslateX}] }]}>
                    <TextInput
                        ref={textInputRef}
                        style={[styles.input, isFocused && { borderColor: Colors.twitchPurple1000, borderWidth: 2}]}
                        placeholder="Type a message..."
                        placeholderTextColor={Colors.twitchBlack700}
                        //multiline
                        numberOfLines={1}
                        //autoCapitalize={chatInput == '' ? 'none' : 'sentences'}
                        value={chatInput}
                        editable={!isSubmitting}
                        caretHidden={!isFocused}
                        onFocus={() => { 
                            setIsFocused(true);
                        }}
                        onBlur={() => {
                            if (textInputRef.current) {
                                textInputRef.current.blur();
                            }
                            setIsFocused(false); }}
                        onSubmitEditing={() => {
                            handleSubmit();
                            setIsFocused(false);
                        }}

                        onChangeText={(text) => dispatch(chatInputSliceActions.setChatInput(text))}
                    />
                    <IconButton
                        icon="happy-outline"
                        size={25}
                        color={showEmoteList ? Colors.twitchPurple1000 :Colors.twitchWhite1000}
                        onPress={() => toggleEmoteList()}
                    />
                </View>
            {showEmoteList && (
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                    [styles.emoteListContainer],
                    {
                        opacity: fadeAnimationRef,
                        transform: [{ translateY: translateAnimationRef }],
                    },
                    ]}
                >
                    <EmoteList
                        height={250}
                        allEmotes={allEmotes}
                    />
                </Animated.View>
            )}
        </View>
    );
}

export default ChatInput;

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.twitchBlack1000,
        borderRadius: 4,
        padding: 4,
        height: 60,
        zIndex: 100,
        
    },
    input: {
        flex: 1,
        backgroundColor: "#353535",
        borderRadius: 8,
        padding: 8,
        color: Colors.twitchWhite1000,
    },
    replyContainer:{
        paddingBottom: 2,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.twitchBlack1000,
        zIndex: 1,
    }
});