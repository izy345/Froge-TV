import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSelector } from "react-redux";
import Colors from "../../constants";

function TwitchBadgeRenderer({ badges }) {
    const twitchBadges = useSelector((state) => state.stream.twitchBadges);

    const renderedBadges = useMemo(() => {
        if (!badges) return null;
        return Object.entries(badges)
            .map(([badgeId, version]) => {
                // Find the matching badge from Redux by comparing set_id and version.
                const matchingBadge = twitchBadges.find(
                    (badge) =>
                        badge.set_id.toLowerCase() === badgeId.toLowerCase() &&
                        badge.id === version
                );
                if (!matchingBadge) return null;
                return (
                    <Image
                        key={badgeId}
                        source={{ uri: matchingBadge.url }}
                        style={styles.badge}
                        cachePolicy="memory-disk"
                    />
                );
            })
            .filter(Boolean);
    }, [badges, twitchBadges]);

    return <View style={styles.badgeContainer}>{renderedBadges}</View>;
}

const styles = StyleSheet.create({
    badgeContainer: {
        flexDirection: "row",
        marginRight: 4,
    },
    badge: {
        width: 16,
        height: 16,
        marginRight: 2,
        transform: [{ translateY: 2 }]
    },
    chatText: {
        fontSize: 15,
        color: Colors.twitchWhite1000,
    },
});

export default React.memo(TwitchBadgeRenderer);
