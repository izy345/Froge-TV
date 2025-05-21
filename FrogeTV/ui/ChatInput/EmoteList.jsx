import React, { useMemo, useState, memo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Colors from "../../constants";
import { Image } from "expo-image";
import { useSelector } from "react-redux";
import RenderEmoteItem from './renderEmoteItem.jsx'
import { FlashList } from "@shopify/flash-list";

function EmoteList({height, allEmotes}) {

    const safeStreamWidth = useSelector((state) => state.stream.safeStreamWidth)
    const phoneIsPotrait = useSelector( (state) => state.phone.phoneIsPotrait);

    // Group emotes by provider and type
    // Assume each emote has a "type" property in the format "Provider-Type"
    const providersData = useMemo(() => {
        const providerMap = {};
        allEmotes.forEach((emote) => {
            const { type } = emote;
            if (!type) return;
            // Split type into provider and type value (default to "default" if no dash)
            const parts = type.split("-");
            const provider = parts[0];
            const emoteType = parts[1] || "default";
            if (!providerMap[provider]) {
                providerMap[provider] = new Set();
            }
            providerMap[provider].add(emoteType);
        });
        // Convert providerMap: an array of objects: { provider: string, types: string[] }
        return Object.entries(providerMap).map(([provider, typesSet]) => ({
            provider,
            types: Array.from(typesSet),
        }));
    }, [allEmotes]);

    // Set default selections for provider and type
    const defaultProvider =
        providersData.length > 0 ? providersData[0].provider : null;
    const defaultType =
        providersData.length > 0 && providersData[0].types.length > 0
            ? providersData[0].types[0]
            : null;

    const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
    const [selectedType, setSelectedType] = useState(defaultType);

    // Filter emotes by the selected provider and type
    const filteredEmotes = useMemo(() => {
        return allEmotes.filter((emote) => {
            if (!emote.type) return false;
            const parts = emote.type.split("-");
            const provider = parts[0];
            const emoteType = parts[1] || "default";
            return provider === selectedProvider && emoteType === selectedType;
        });
    }, [allEmotes, selectedProvider, selectedType]);

    const renderEmoteItemMemoized = useCallback(
        ({ item }) => <RenderEmoteItem item={item} />,
        []
      );

    return (
        <View style={[styles.container, { height: height }]} pointerEvents="box-none">
            {/* Horizontal list for providers */}
            <View style={styles.tabContainers}>
                <FlatList
                    data={providersData}
                    horizontal
                    keyExtractor={(item) => item.provider}
                    renderItem={
                        ({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.providerItem,
                                    selectedProvider === item.provider && styles.selectedProvider,
                                ]}
                                onPress={() => {
                                    setSelectedProvider(item.provider);
                                    // Default to first type for that provider
                                    setSelectedType(item.types[0]);
                                }}
                            >
                                <Text style={styles.providerText}>{item.provider}</Text>
                            </TouchableOpacity>
                        )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.providerList}
                />
            </View>
            {/* Horizontal list for types */}
            <View style={styles.tabContainers}>
                <FlatList
                    data={
                        providersData.find((p) => p.provider === selectedProvider)
                            ?.types || []
                    }
                    horizontal
                    keyExtractor={(item, index) => item + index}
                    renderItem={
                        ({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.typeItem,
                                    selectedType === item && styles.selectedType,
                                ]}
                                onPress={() => setSelectedType(item)}
                            >
                                <Text style={styles.typeText}>{item}</Text>
                            </TouchableOpacity>
                        )
                    }
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.typeList}
                />
            </View>
            {/* List of emotes for the selected provider and type */}
            <FlashList
                data={filteredEmotes}
                keyExtractor={(item, index) => `${item.emoteName}-${index}`}
                renderItem={({ item }) => renderEmoteItemMemoized({ item })}
                numColumns={
                    phoneIsPotrait
                    ? Math.floor(safeStreamWidth / 49)
                    : Math.floor((safeStreamWidth * 0.25) / 49)
                }
                contentContainerStyle={styles.emotesList}
                initialNumToRender={50}
                maxToRenderPerBatch={50}
                estimatedItemSize={44}
            />
        </View>
    );
}

export default memo(EmoteList);

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: Colors.twitchBlack950,
        width: "100%",
    },
    tabContainers:{
        backgroundColor: Colors.twitchBlack1000,
    },
    providerItem: {
        padding: 8,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.twitchBlack1000,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    selectedProvider: {
        backgroundColor: Colors.twitchPurple1000,
    },
    providerText: {
        color: Colors.twitchWhite1000,
        fontSize: 12,
    },
    providerList: {
        backgroundColor: Colors.twitchBlack1000,
        alignItems: "center",
        marginTop: 5,
        marginBottom: 0,
        height: 40,
        maxHeight: 40,
        flexGrow: 1,
    },
    typeList: {
        backgroundColor: Colors.twitchBlack1000,
        alignItems: "center",
        marginTop: 0,
        height: 40,
        maxHeight: 40,
        marginBottom: 5,
        flexGrow: 1,
    },
    typeItem: {
        padding: 3,
        backgroundColor: Colors.twitchBlack1000,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
        height: 30,
        marginVertical: 0
    },
    selectedType: {
        backgroundColor: Colors.twitchPurple1000,
    },
    typeText: {
        color: Colors.twitchWhite1000,
        fontSize: 12,
    },
    emotesList: {
        width: "100%",
        pointerEvents: "box-none",
    },
});
