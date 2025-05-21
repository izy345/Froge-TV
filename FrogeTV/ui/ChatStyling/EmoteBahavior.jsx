import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

function EmoteBehavior({ mainEmote, flaggedEmotes, flaggedEmoteNum }) {
    // Determine if we have any 256 flag values.
    const overlay256 = useMemo(
        () => flaggedEmoteNum.includes(256) || flaggedEmoteNum.includes("256"),
        [flaggedEmoteNum]
    );
    // Count how many 256 flags exist across all flagged emotes.
    const overlay256Count = useMemo(
        () =>
            flaggedEmoteNum.filter((flag) => flag === 256 || flag === "256")
                .length,
        [flaggedEmoteNum]
    );

    // Use main emote dimensions.
    const width = mainEmote.width || 32;
    const height = mainEmote.height || 32;

    const flaggedMaxWidth = useMemo(() => {
        if (flaggedEmotes && flaggedEmotes.length > 0) {
            return Math.max(
                width,
                ...flaggedEmotes.map(fe => fe.width || 32)
            );
        }
        return width;
    }, [flaggedEmotes, width]);

    return (
        <View style={[styles.container, { width: flaggedMaxWidth, height }]}>
            {/* Main emote */}
            <Image
                key={mainEmote.emoteUrl}
                source={{ uri: mainEmote.emoteUrl }}
                style={[styles.emote, { width, height }]}
                contentFit="contain"
                cachePolicy="memory-disk"
                pointerEvents="none"
            />
            {/* If flagged overlays exist (for flag value 256), render them */}
            {overlay256 && overlay256Count > 0 && (
                <View style={styles.overlayContainer} pointerEvents="none">
                    {flaggedEmotes.map((flaggedEmote, index) => {
                        // Only render an overlay for this flagged emote if its flag includes 256.
                        if (
                            Array.isArray(flaggedEmote.flag)
                                ? flaggedEmote.flag.includes(256) || flaggedEmote.flag.includes("256")
                                : flaggedEmote.flag === 256 || flaggedEmote.flag === "256"
                        ) {
                            const FEwidth = flaggedEmote.width || 32;
                            const FEheight = flaggedEmote.height || 32;
                            return (
                                <Image
                                    key={`${flaggedEmote.emoteUrl}-${index}`}
                                    source={{ uri: flaggedEmote.emoteUrl }}
                                    style={[
                                        styles.flaggedEmote,
                                        {
                                            width: FEwidth,
                                            height: FEheight,
                                            zIndex: 10 + index,
                                        },
                                    ]}
                                    pointerEvents="none"
                                    contentFit="contain"
                                    cachePolicy="memory-disk"
                                />
                            );
                        }
                        return null;
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        marginHorizontal: 2,
        alignItems: "center",
        transform: [{ translateY: 8 }, { scale: 0.95 }],
    },
    overlayContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    emote: {
        //transform: [{ translateY: 8 }, { scale: 0.87 }],
    },
    flaggedEmote: {
        position: "absolute",
    },
});

export default memo(EmoteBehavior);
