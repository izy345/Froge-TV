import React, { useCallback } from "react";
import { View, Image, StyleSheet } from "react-native";

function FFZBadgeRenderer({ user_id, badges = [], userMapping = [] }) {

    const matchingBadges = useCallback(() => {

        return badges ? badges.filter((badge) => {
            const badgeUsers = userMapping[String(badge.id)];
            if (badgeUsers && Array.isArray(badgeUsers)) {
                console.log()
                return (
                    badgeUsers.includes(Number(user_id)) ||
                    badgeUsers.includes(user_id)
                );
            }
            return false;
        }) : [];
    }, [badges, userMapping, user_id]);

    if (matchingBadges.length === 0) {
        return null;
    }

    return (
        <View style={styles.badgeContainer}>
            {matchingBadges.map((badge) => (
                <Image
                    key={badge.id}
                    source={{ uri: badge.image }}
                    style={styles.badge}
                    resizeMode="contain"
                />
            ))}
        </View>
    );
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
});

// Export a memoized version to prevent unnecessary re-renders.
export default React.memo(FFZBadgeRenderer);
