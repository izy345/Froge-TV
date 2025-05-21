import React, { useState, useEffect } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RenderEmoteItem from "./renderEmoteItem";
import Colors from "../../constants";

function EmoteRecommendation({ allEmotes }) {
    const chatInput = useSelector((state) => state.chatInput.chatInput);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            // If the last character is a space, do not recommend.
            if (chatInput.slice(-1) === " ") {
                setRecommendations([]);
                return;
            }
            // Extract the current (last) word from chatInput.
            const tokens = chatInput.split(" ");
            const currentWord = tokens[tokens.length - 1].trim();
            if (!currentWord) {
                setRecommendations([]);
                return;
            }
            const lowerCurrent = currentWord.toLowerCase();
            // Filter emotes that include the current word.
            let matches = allEmotes.filter((emote) =>
                emote.emoteName.toLowerCase().includes(lowerCurrent)
            );
            // Prioritize those that start with the current word.
            matches.sort((a, b) => {
                const aName = a.emoteName.toLowerCase();
                const bName = b.emoteName.toLowerCase();
                const aStarts = aName.startsWith(lowerCurrent) ? 0 : 1;
                const bStarts = bName.startsWith(lowerCurrent) ? 0 : 1;
                if (aStarts !== bStarts) return aStarts - bStarts;
                return aName.localeCompare(bName);
            });
            // Keep only the top 5 matches.
            setRecommendations(matches.slice(0, 9));
        }, 100);

        return () => clearTimeout(timer);
    }, [chatInput, allEmotes]);

    if (recommendations.length === 0) return null;

    return (
        <View style={styles.container}>
            <FlatList
                data={recommendations}
                keyboardShouldPersistTaps='always'
                showsHorizontalScrollIndicator={false}
                horizontal
                keyExtractor={(item, index) => `${item.emoteName}-${item.type}-${item.provider}-${item?.widh ?? 32 }x${item?.height ?? 32}-${index}`}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <RenderEmoteItem item={item} size={28} margin={2} allowAutoResize  />
                    </View>
                )}
            />
        </View>
    );
}

export default EmoteRecommendation;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        backgroundColor: Colors.twitchBlack950,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 4,
        padding: 4,
        borderRadius: 4,
    },
    emoteName: {
        color: "#fff",
        marginLeft: 4,
        fontSize: 14,
    },
});
