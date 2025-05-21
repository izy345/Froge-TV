import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SvgXml } from "react-native-svg";

// Helper component to fetch and render remote SVG content.
const RemoteSVG = ({ uri, width, height }) => {
    const [svgXml, setSvgXml] = useState(null);

    useEffect(() => {
        let isMounted = true;
        fetch(uri)
            .then((res) => res.text())
            .then((text) => {
                if (isMounted) {
                    setSvgXml(text);
                }
            })
            .catch((error) => {
                console.error("Error fetching SVG:", error);
            });
        return () => {
            isMounted = false;
        };
    }, [uri]);

    if (!svgXml) {
        return <ActivityIndicator style={{ width, height }} />;
    }

    return <SvgXml xml={svgXml} width={width} height={height} />;
};

function BTTVBadgeRenderer({ username, badges }) {
    // Filter badges where the name property matches the username (case-insensitive)
    const matchingBadges = useMemo(() => {
        if (!badges || !username) return [];
        return badges.filter(
            (badgeObj) => badgeObj.name.toLowerCase() === username.toLowerCase()
        );
    }, [badges, username]);

    return (
        <View style={styles.badgeContainer}>
            {matchingBadges.map((badgeObj) => (
                <RemoteSVG
                    key={badgeObj.id}
                    uri={badgeObj.badge.svg}
                    width={styles.badge.width}
                    height={styles.badge.height}
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

export default React.memo(BTTVBadgeRenderer);
