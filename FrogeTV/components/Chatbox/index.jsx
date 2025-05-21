import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";
import tmi from "tmi.js";
import ChatStyling from "../../ui/ChatStyling";
import { useDispatch, useSelector } from "react-redux";
import streamActions from "../../store/StreamSlice/stream-thunks";
import Colors from "../../constants";
import ChatInput from "../../ui/ChatInput";
import { userDetailsModalSliceActions } from "../../store/UserDetailsModal/user-details-modal-slice";
import userDetailsModalActions from "../../store/UserDetailsModal/user-details-modal-thunks";

function Chatbox({ channelName, user_id }) {
    const dispatch = useDispatch();

    const twitchEmotes = useSelector((state) => state.stream.twitchEmotes);
    const localTwitchEmotes = useSelector((state) => state.stream.localTwitchEmotes);
    const BTTVEmotes = useSelector((state) => state.stream.BTTVEmotes);
    const localBTTVEmotes = useSelector((state) => state.stream.localBTTVEmotes);
    const BTTVBadges = useSelector((state) => state.stream.BTTVBadges);
    const FFZEmotes = useSelector((state) => state.stream.FFZEmotes);
    const localFFZEmotes = useSelector((state) => state.stream.localFFZEmotes);
    const FFZBadges = useSelector((state) => state.stream.FFZBadges);
    const sevenTVEmotes = useSelector((state) => state.stream.sevenTVEmotes);
    const localSevenTVEmotes = useSelector((state) => state.stream.localSevenTVEmotes);

    // config
    const chatScrollAnimationIsActive = useSelector((state) => state.config.chatScrollAnimationIsActive);
    const hideDeletedMessages = useSelector((state) => state.config.hideDeletedMessages);
    //const msgsDelay = useSelector((state) => state.config.msgsDelay);

    const yourUserName = useSelector((state) => state.auth.userName);

    const allEmotes = useMemo(
        () => [
            ...(twitchEmotes || []),
            ...(localTwitchEmotes || []),
            ...(BTTVEmotes || []),
            ...(localBTTVEmotes || []),
            ...(FFZEmotes || []),
            ...(localFFZEmotes || []),
            ...(sevenTVEmotes || []),
            ...(localSevenTVEmotes || []),
        ],
        [twitchEmotes,localTwitchEmotes, BTTVEmotes,localBTTVEmotes, FFZEmotes,localFFZEmotes, sevenTVEmotes, localSevenTVEmotes]
    );


    const [chatMessages, setChatMessages] = useState([]);
    const [pauseScroll, setPauseScrollMain] = useState(false);

    const isThrottledRef = useRef(false);

    const setPauseScroll= useCallback((value) => {
        if (!isThrottledRef.current) {
            // Trigger instantly
            setPauseScrollMain(value);
            // Disallow further triggers for 1 second.
            isThrottledRef.current = true;
            setTimeout(() => {
                isThrottledRef.current = false;
            }, Platform.OS === 'ios' ? 0 : 700);
        }
    }, []);

    // avoid initializing listeners multiple times
    const clientRef = useRef(null);
    // Reference to handle autoscrolling
    const flatListRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    // Fetch required badges and emotes when component mounts.
    useEffect(() => {
        const getRequiredData = async () => {
            dispatch(streamActions.getTwitchBadges(user_id));
            dispatch(streamActions.getTwitchEmotes(user_id));
            dispatch(streamActions.get7TVEmotes(user_id));
            dispatch(streamActions.getBTTVBadges());
            dispatch(streamActions.getBTTVEmotes(user_id));
            dispatch(streamActions.getFFZBadges());
            dispatch(streamActions.getFFZEmotes(user_id));
        };
        getRequiredData();
    }, [dispatch, user_id]);

    // Handler for standard chat messages.
    const handleMessage = useCallback((channel, tags, message, self) => {
        if (self) return;
        // check for extra emote sets
        //console.log("Incoming message tags:", tags.emotes);

        // check if the message is from a first-time chatter
        const isFirstTimeChatter = tags["first-msg"] === true;
        const userId = tags["user-id"];
        // check if the message is a reply
        const replied = tags["reply-parent-msg-body"]
            ? {
                replied: true,
                replymsg: `${tags["reply-parent-display-name"] || tags["reply-parent-user-login"]}: ${tags["reply-parent-msg-body"]}`,
            }
            : { replied: false, replymsg: "" };
        // the Chat Object to be passed
        const newMsg = {
            id: tags.id,
            userId,
            username: tags["display-name"] || tags.username,
            nameColor: tags.color || "#9b9b9b",
            badges: tags.badges || {},
            emotes: tags.emotes || {},
            message,
            type: isFirstTimeChatter ? "first-message" : "message",
            replied,
        };

        setChatMessages((prev) => {
            const updated = [...prev, newMsg];
            if ((updated.length > 90) && !pauseScroll) {
                return updated.slice(updated.length - 90);
            }
            return updated;
        });
    }, [pauseScroll, twitchEmotes, localTwitchEmotes]);


    // Handler for subscription events.
    const handleSubscription = useCallback(
        (channel, username, method, message, userstate) => {
            const newMsg = {
                id: String(Date.now() + Math.random() + Math.random()),
                username,
                nameColor: "#ffd700", // Use a distinct color for subs.
                badges: userstate.badges || {},
                emotes: {},
                message: `[Sub] ${userstate['system-msg'] || ''} :${message || "Thank you for subscribing!"}`,
                type: "subscription",
            };

            setChatMessages((prev) => {
                const updated = [...prev, newMsg];
                if (updated.length > 90 && !pauseScroll) {
                    return updated.slice(updated.length - 90);
                }
                return updated;
            });
        },[pauseScroll]);

    // Handler for resubscription events.
    const handleResubscription = useCallback(
        (channel, username, months, message, userstate, methods) => {

            const newMsg = {
                id: String(Date.now() + Math.random() + Math.random()),
                username,
                nameColor: "#ffd700",
                badges: userstate.badges || {},
                emotes: {},
                message: `[Resub] ${userstate['system-msg'] || ''}: ${message || "Thank you for resubscribing!"}`,
                type: "resubscription",
            };

            setChatMessages((prev) => {
                const updated = [...prev, newMsg];
                if (updated.length > 90 && !pauseScroll) {
                    return updated.slice(updated.length - 90);
                }
                return updated;
            });
        },[pauseScroll]);

    // Handler for gifted subscription events.
    const handleSubGift = useCallback(
        (channel, username, streakMonths, recipient, methods, userstate) => {
            const newMsg = {
                id: String(Date.now() + Math.random() + Math.random()),
                username,
                nameColor: "#ffd700",
                badges: userstate.badges || {},
                emotes: {},
                message: `[Sub Gift] ${username} gifted a sub to ${recipient}`,
                type: "subgift",
            };

            setChatMessages((prev) => {
                const updated = [...prev, newMsg];
                if (updated.length > 90 && !pauseScroll) {
                    return updated.slice(updated.length - 90);
                }
                return updated;
            });
        },
        [pauseScroll]
    );

    const handleMessageDeleted = useCallback(
        (channel, username, deletedMessage, userstate) => {
            //console.log("Message deleted event:", deletedMessage);
            const deletedId = userstate["target-msg-id"]; // Extract the deleted message ID
            if (!deletedId) return; // Check if the ID exists
            setChatMessages((prev) =>
                prev.map((m) =>
                    m.id === deletedId
                        ? {
                            ...m,
                            deleted: {
                                del: true,
                                delmsg: "Msg deleted by moderator", 
                            },
                            message: !hideDeletedMessages ? `${m.message} - deleted` : '<message deleted>',
                        }
                        : m
                )
            );
        },[]);

    // Connect to Twitch chat and attach event listeners for various events.
    useEffect(() => {
        if (!channelName) {
            console.warn("No channel name provided");
            return;
        }
        //console.log("Connecting to Twitch chat for channel:", channelName);
        // Unlikely, but if the client is already connected, abort the connection.
        if (clientRef.current && clientRef.current._options && clientRef.current._options.connection?.reconnect) {
            //console.log("Reusing existing client");
            return;
        }
        const client = new tmi.Client({
            connection: {
                reconnect: true,
                secure: true,
                reconnectInterval: 1500,
            },
            channels: [channelName],
        });
        // set a ref to the client to avoid reinitializing it
        clientRef.current = client;
        client.connect().catch(console.error);

        client.on("message", handleMessage);
        client.on("subscription", handleSubscription);
        client.on("resub", handleResubscription);
        client.on("subgift", handleSubGift);
        client.on("messagedeleted", handleMessageDeleted);
        client.on("raw_message", (messageData) => {
            const { tags } = messageData;
            if (messageData.command === "CLEARCHAT") {
                //console.log("Raw CLEARCHAT:", messageData);
                // Try to get a specific message deletion id
                const deletedMsgId = tags["target-msg-id"];
                if (deletedMsgId) {
                    setChatMessages((prev) =>
                        prev.map((m) =>
                            m.id === deletedMsgId
                                ? {
                                    ...m,
                                    deleted: {
                                        del: true,
                                        delmsg: `Timeout for ${messageData.tags["ban-duration"]}`,
                                    },
                                    message: `${m.message} - deleted`,
                                }
                                : m
                        )
                    );
                } else if (messageData.tags["target-user-id"]) {
                    // No message id was provided – mark all messages from that user as deleted.
                    //console.log('ID:', messageData.tags["target-user-id"]);
                    setChatMessages((prev) =>
                        prev.map((m) =>
                            m.userId === messageData.tags["target-user-id"]
                                ? {
                                    ...m,
                                    deleted: {
                                        del: true,
                                        delmsg: `${messageData.tags["ban-duration"] ?' Timeout for ' + messageData.tags["ban-duration"] + ' seconds' : ' Permanent ban'}`,
                                    },
                                    message: !hideDeletedMessages ? `${m.message} - deleted` : '<message deleted>',
                                }
                                : m
                        )
                    );
                }
            }
        });

        return () => {
            client.disconnect();
            client.current = null;
        };
    }, [channelName, handleMessage, handleSubscription, handleResubscription, handleSubGift, handleMessageDeleted]);

    useEffect(() => {
        if (!pauseScroll && chatScrollAnimationIsActive) {
            // auto scroll
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                if (!pauseScroll) {
                    //console.log("Scrolling to end");
                    flatListRef.current?.scrollToEnd({ animated: true });
                }
            }, 100);
        }
    }, [chatMessages, pauseScroll]);

    const handleOpenUserModal = useCallback( async (item) => {
                item.allEmotes = allEmotes;
                item.BTTVBadges = BTTVBadges;
                item.FFZBadges = FFZBadges;
                dispatch(userDetailsModalSliceActions.setShowUserDetailsModal(true));
                await dispatch(userDetailsModalActions.getChatterInfo(item.userId));
                dispatch(userDetailsModalSliceActions.setSelectedUserMsg(item))
        },[allEmotes, BTTVBadges, FFZBadges]);
    
        const handleScroll = useCallback((event) => {
            // For an inverted FlatList, contentOffset.y of 0 is the "bottom"
            const offset = event.nativeEvent.contentOffset.y;
            // if near bottom (say, less than 20), then resume auto-scroll if it was paused.
            if (offset < 20 && pauseScroll) {
                setPauseScroll(false);
            }
        }, [pauseScroll]);

        const renderChatMessage = useCallback(
            ({ item }) => (
                <ChatStyling
                    key={item.id}
                    user_id={user_id || ""}
                    chatMsg={item.message}
                    emotes={allEmotes}
                    allowedEmotes={item.emotes}
                    username={item.username}
                    nameColor={item.nameColor}
                    badges={item.badges}
                    bttvBadges={BTTVBadges}
                    FFZBadges={FFZBadges}
                    type={item.type}
                    deleted={item.deleted}
                    replied={item.replied}
                    yourUserName={yourUserName}
                    onNamePress={() => handleOpenUserModal(item)}
                />
            ),
            [user_id, allEmotes, BTTVBadges, FFZBadges, yourUserName, handleOpenUserModal,]
        );

    // When new messages arrive and not paused, update the displayed messages.
    const [displayedMessages, setDisplayedMessages] = useState([]);
    useEffect(() => {
        if (!pauseScroll && !chatScrollAnimationIsActive) {
            setDisplayedMessages(chatMessages);
        }
        }, [chatMessages, pauseScroll]);

        const invertedMessages = useMemo(() => [...displayedMessages].reverse(), [displayedMessages]);

    return (
        <View style={styles.container}
            pointerEvents="box-none"
        >
            { !chatScrollAnimationIsActive ?
            <FlatList
                numColumns={1}
                inverted
                ref={flatListRef}
                data={invertedMessages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onScrollBeginDrag={(e) => {
                    if (!pauseScroll) {
                        setPauseScroll(true);
                    }
                }}
                //initialNumToRender={100}

                //maxToRenderPerBatch={100}
                windowSize={4}
                //updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
            />
            :
            <ScrollView
                ref={flatListRef}
                contentContainerStyle={styles.listContentAnimated}
                onScrollBeginDrag={() => setPauseScroll(true)}
            >
                {chatMessages.map(item => renderChatMessage({ item }))}
            </ScrollView>
            }
            {pauseScroll && (
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => {
                        setPauseScroll(false);
                        if (chatScrollAnimationIsActive){
                        flatListRef.current.scrollToEnd({ animated: true });
                        } else{
                            
                            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
                        }
                    }}
                >
                    <Text style={styles.continueButtonText}>Continue Chat</Text>
                </TouchableOpacity>
            )}
            <ChatInput 
                allEmotes={allEmotes}
                broadcasterId={user_id}
            />
        </View>
    );
}

export default Chatbox;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: "#000000",
    },
    listContent: {
        flexGrow: 1,
    },
    listContentAnimated:{
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    continueButton: {
        position: "absolute",
        bottom: 27,
        left: "30%",
        right: "30%",
        marginBottom: 40,
        padding: 10,
        backgroundColor: "#353535d6",
        borderRadius: 8,
        alignItems: "center",
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 0,
    },
    continueButtonText: {
        color: Colors.twitchWhite1000,
        fontSize: 14,
    },
});
