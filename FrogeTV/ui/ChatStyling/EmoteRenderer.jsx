import React, { useMemo } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import EmoteBehavior from "./EmoteBahavior";
import { formatTwitchGivenEmotes } from "../../utils/FormatTwitchGivenEmotes";
import { useDispatch, useSelector } from "react-redux";
import { emoteDetailsModalSliceActions } from "../../store/EmoteDetailsModal/emoteDetailsModal-slice";
import EmoteSync from "./EmoteSync";

function EmoteRenderer({
    message = "",
    emotes = [],
    enforceTwitchEmotePolicy = false,
    twitchGivenEmoteList = [],
    style = {},
    attemptEmoteSync = false,
}) {
    const dispatch = useDispatch();
    

    const { combinedEmotes, formattedTwitchEmotes } = useMemo(() => {
        let baseEmotes = [...emotes];
        let twitchEmotes = [];
        if (
            twitchGivenEmoteList &&
            Object.keys(twitchGivenEmoteList).length > 0
        ) {
            twitchEmotes = formatTwitchGivenEmotes(message, twitchGivenEmoteList);
            if (Array.isArray(twitchEmotes)) {
                baseEmotes = [...baseEmotes, ...twitchEmotes];
            }
        }
        return {
            combinedEmotes: baseEmotes,
            formattedTwitchEmotes: twitchEmotes
        };
    }, [emotes, twitchGivenEmoteList, message]);

    // Build map of emoteName -> [emotes]
    const emoteMap = useMemo(() => {
        const map = new Map();
        combinedEmotes.forEach((emote) => {
            if (!map.has(emote.emoteName)) {
                map.set(emote.emoteName, []);
            }
            map.get(emote.emoteName).push(emote);
        });
        return map;
    }, [combinedEmotes]);

    const tokens = useMemo(() => {
        return message.split(/(\s+)/);
    }, [message]);

    const elements = useMemo(() => {
        const elems = [];
        let i = 0;
        while (i < tokens.length) {
            const token = tokens[i];

            if (token.trim() === "󠀀") {
                elems.push(
                    <Text style={styles.chatText} key={i}>
                        {" "}
                    </Text>
                );
                i++;
                continue;
            }

            let matchingEmotesRaw = emoteMap.get(token) || [];

            const matchingEmotes = enforceTwitchEmotePolicy && formattedTwitchEmotes.length > 0
                ? matchingEmotesRaw.filter(emote => {
                    if (emote.type === "TwitchTV") {
                        return formattedTwitchEmotes.some(e => e.emoteId === emote.emoteId);
                    }
                    return true;
                })
                : matchingEmotesRaw;

            if (matchingEmotes.length > 0) {
                const emote = matchingEmotes.reduce((prev, curr) => {
                    const prevWidth = prev.width || styles.emoteImage.width;
                    const currWidth = curr.width || styles.emoteImage.width;
                    return currWidth > prevWidth ? curr : prev;
                }, matchingEmotes[0]);

                let flaggedEmotes = [];
                let j = i + 1;
                while (j < tokens.length) {
                    const nextToken = tokens[j];
                    if (nextToken.trim() === "") {
                        j++;
                        continue;
                    }
                    const potentialFlags = emoteMap.get(nextToken) || [];
                    const matchingFlag = potentialFlags.find(
                        (e) => e.flag && e.flag.length > 0
                    );
                    if (matchingFlag) {
                        flaggedEmotes.push(matchingFlag);
                        j++;
                    } else {
                        break;
                    }
                }

                if (flaggedEmotes.length > 0) {
                    const combinedFlags = flaggedEmotes
                        .map((fe) => (Array.isArray(fe.flag) ? fe.flag : [fe.flag]))
                        .flat();

                    elems.push(
                        <Pressable
                            key={i}
                            style={{ textAlignVertical: "center", fontSize: 0 }}
                            onPress={() => {
                                dispatch(
                                    emoteDetailsModalSliceActions.setEmoteDetailsModalVisible(true)
                                );
                                dispatch(
                                    emoteDetailsModalSliceActions.setEmoteDetails(emote)
                                );
                                dispatch(
                                    emoteDetailsModalSliceActions.setSecondEmoteDetails(flaggedEmotes)
                                );
                            }}
                        >
                            <EmoteBehavior
                                mainEmote={emote}
                                flaggedEmotes={flaggedEmotes}
                                flaggedEmoteNum={combinedFlags}
                            />
                        </Pressable>
                    );
                    i = j;
                } else {
                    const emoteStyle = {
                        width: emote.width || styles.emoteImage.width,
                        height: emote.height || styles.emoteImage.height,
                        marginHorizontal: styles.emoteImage.marginHorizontal,
                        transform: [{ translateY: 2 }, { scale: 0.87 }],
                    };
                    elems.push(
                        <Pressable
                            key={i}
                            onPress={() => {
                                dispatch(
                                    emoteDetailsModalSliceActions.setEmoteDetailsModalVisible(true)
                                );
                                dispatch(
                                    emoteDetailsModalSliceActions.setEmoteDetails(emote)
                                );
                                dispatch(
                                    emoteDetailsModalSliceActions.setSecondEmoteDetails({})
                                );
                            }}
                            style={{
                                height: emoteStyle.height - 8,
                                alignItems: "center",
                                fontSize: 0,
                                paddingBottom: 8,
                                marginBottom: 8,
                            }}
                        >
                            {  // Experimental: Use EmoteSync for animated emotes
                            (emote.isAnimated && attemptEmoteSync) ? 
                                <EmoteSync
                                    key={emote.emoteUrl}
                                    source={emote.emoteUrl}
                                    style={emoteStyle}
                                    emoteId={emote.emoteUrl}
                                />
                            :
                                <Image
                                    key={i}
                                    recyclingKey={emote.emoteUrl}
                                    source={{ uri: emote.emoteUrl }}
                                    style={emoteStyle}
                                    contentFit="contain"
                                    cachePolicy='disk'
                                /> 
                            }
                        </Pressable>
                    );
                    i++;
                }
            } else {
                elems.push(
                    <Text style={styles.chatText} key={i}>
                        {token}
                    </Text>
                );
                i++;
            }
        }
        return elems;
    }, [tokens, emoteMap, formattedTwitchEmotes, enforceTwitchEmotePolicy, dispatch]);

    return <Text style={style}>{elements}</Text>;
}

const styles = StyleSheet.create({
    emoteImage: {
        width: 32,
        height: 32,
        marginHorizontal: 0,
    },
    chatText: {
        // Adjust as needed.
    },
});

export default React.memo(EmoteRenderer);
