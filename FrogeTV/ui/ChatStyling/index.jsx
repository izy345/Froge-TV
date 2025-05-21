import React, { useCallback, useMemo, memo } from "react";
import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback } from "react-native";
import Colors from "../../constants";
import TwitchBadgeRenderer from "./TwitchBadgeRenderer";
import EmoteRenderer from "./EmoteRenderer";
import BTTVBadgeRenderer from "./BTTVBadgeRenderer";
import FFZBadgeRenderer from "./FFZBadgeRenderer";
import Icon from "../CustomIcons";
import { useDispatch, useSelector } from "react-redux";


function ChatStyling({
    chatMsg,
    user_id,
    username,
    nameColor,
    badges,
    bttvBadges,
    FFZBadges,
    type,
    emotes,
    yourUserName,
    allowedEmotes = [],
    deleted = { del: false, delmsg: "timout" },
    replied = { replied: false, replymsg: "reply" },
    onNamePress = () => {},
}) {

    const showBTTVBadges = useSelector((state) => state.config.showBTTVBadges);


    const isMentioned = useMemo(() => {
        if (!yourUserName || !chatMsg) return false;
        return chatMsg.toLowerCase().includes(`${yourUserName.toLowerCase()}`);
    }, [chatMsg, yourUserName]);

    const usernameStyle = useMemo(() => {
        return [
            deleted.del ? styles.deletedUsername : styles.username,
            { color: deleted.del ? Colors.twitchBlack800 : nameColor }
            ];
    }, [deleted.del, nameColor]);

    const handleNamePress = useCallback(() => {
        onNamePress();
    }, [onNamePress]);

    return (
        <View
            style={[
                styles.chatMessageContainer,
                type === "first-message"
                    ? styles.chatFirstMsgContainer
                    : type !== "message"
                    ? styles.chatEventContainer
                    : replied.replied
                    ? styles.chatRepliedMsgContainer
                    : null
                    ,
                isMentioned && styles.chatMentiontMsgContainer,
                deleted.del && styles.chatDeletedMsgContainer
            ]}
        >
            {type === "first-message" &&  <Text style={styles.notifiedChatText}>First Time Message</Text>}
            {deleted.del && <Text style={styles.notifiedChatText}>{deleted.delmsg}</Text>}
            {replied.replied && (
                <View style={[styles.headerRow, { paddingTop: 4 }]}>
                    <Icon
                        icon="arrow-redo-outline"
                        size={12}
                        color={Colors.twitchBlack700}
                    />
                    <Text style={styles.chatTextReply}>{replied.replymsg}</Text>
                </View>
            )}
            <Text style={styles.messageText}>
                <TwitchBadgeRenderer
                    badges={badges}
                />
                { showBTTVBadges &&
                    <BTTVBadgeRenderer
                        username={username}
                        badges={bttvBadges}
                    />
                }
                <FFZBadgeRenderer
                    user_id={user_id}
                    badges={FFZBadges?.badges}
                    userMapping={FFZBadges?.users}
                />
                <TouchableWithoutFeedback onPress={handleNamePress}>
                    <Text style={usernameStyle}>
                        {username}:{" "}
                    </Text>
                </TouchableWithoutFeedback>
                <EmoteRenderer
                    style={[styles.chatText, deleted.del && styles.chatTextDeleted]}
                    enforceTwitchEmotePolicy
                    message={chatMsg}
                    emotes={emotes}
                    twitchGivenEmoteList={allowedEmotes}
                />
            </Text>
        </View>
    );
}

export default memo(ChatStyling);

const styles = StyleSheet.create({
    chatMessageContainer: {
        marginBottom: 4,
        marginTop: 4,
        //backgroundColor: "blue", for debugging
    },
    chatEventContainer: {
        backgroundColor: Colors.twitchPurple1000Transparent,
        padding: 5,
        borderRadius: 5
    },
    chatFirstMsgContainer: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.twitchPurple900,
        padding: 5,
        backgroundColor: Colors.twitchPurple900Transparent,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 5
    },
    chatMentiontMsgContainer: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.twitchRed1000,
        padding: 5,
        backgroundColor: Colors.twitchRed1000Transparent,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 5
    },
    chatDeletedMsgContainer: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.twitchBlack800,
        padding: 5,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 5
    },
    chatRepliedMsgContainer: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.twitchBlack700,
        padding: 5,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 5
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap"
    },
    username: {
        fontWeight: "bold",
        fontSize: 16,
        flexShrink: 1
    },
    deletedUsername: {
        fontWeight: "bold",
        fontSize: 15,
        color: Colors.twitchBlack800,
        flexShrink: 1
    },
    messageText: {
        flexShrink: 1,
        flexWrap: "wrap"
    },
    chatText: {
        fontSize: 14.5,
        color: Colors.twitchWhite1000,
        lineHeight: 22,
    },
    notifiedChatText: {
        fontSize: 12,
        color: Colors.twitchBlack700,
        paddingBottom: 2,
    },
    chatTextDeleted: {
        fontSize: 14,
        color: Colors.twitchBlack800,
        lineHeight: 22,
    },
    chatTextReply: {
        fontSize: 12,
        color: Colors.twitchBlack700
    },
    onPress: {
        opacity: 0.75
    }
});