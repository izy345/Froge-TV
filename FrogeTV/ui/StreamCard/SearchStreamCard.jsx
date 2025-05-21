import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, Pressable } from "react-native"
import { Image } from 'expo-image'
import { useLayoutEffect, useState, useEffect, useMemo, useCallback } from "react"
import Colors, { commonStyles } from "../../constants";
import { useSelector } from "react-redux";
import TwitchExtension from "../../API/ExtensionAPI/twitch";
import StreamCard from ".";
import { useNavigation } from '@react-navigation/native';

function SearchStreamCard({
    id,
    user_login,
    user_name,
    game_name,
    is_live=false,
    started_at,
    thumbnail_url,
    title='<no title>',
    }) {

        const navigation = useNavigation();

        const phoneIsPotrait = useSelector( (state) => state.phone.phoneIsPotrait);

        const { width: windowWidth, height: windowHeight } = useWindowDimensions()
    
        // in some devices, specifically ipadOS, the hook useWindowDimensions
        // does not update when the device is rotated, so we need to use
        // the following code to get the screen width. Just inverted
        const screenWidth = useMemo(() => {
            if (windowWidth < windowHeight) {
                return windowWidth;
            } else {
                return windowHeight;
            }
        }, [windowWidth, windowHeight]);
    

    const [streamDetails, setStreamDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getStreamDetails = async () => {
            if (!is_live) {
                setIsLoading(false);
                return;
            }
            const response = await TwitchExtension.getStreamDetails(id);
            if (response) {
                //console.log("[SearchStreamCard]:", response);
                setStreamDetails(response);
                setIsLoading(false);
            }
            setIsLoading(false);
        };
        // Run immediately on mount.
        getStreamDetails();
        // Then run every 8 minutes.
    }, [id]);

    const handleStreamPress = useCallback(() => {
            navigation.navigate('Stream', {
                channelName: user_name,
                channelLogin: user_login,
                channelId: id,
            });
        },[navigation, user_name, id, user_login]);

    if (is_live && isLoading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center", height: 100 }]}>
                <ActivityIndicator size="large" color={Colors.twitchPurple1000} />
            </View>
        );
    }

    return (
        <>
    { !is_live ?
    <Pressable
        onPress={handleStreamPress}
        style={ ({pressed}) => [styles.container, {width: screenWidth * 0.96} ,phoneIsPotrait ? {maxWidth: 690} : {maxWidth: 390}, pressed && styles.onPress]}>
        <View style={styles.DetailsContainer}>
            <Image
                source={{ uri: thumbnail_url }}
                style={styles.profileImage}
                contentFit="cover"
            />
            <Text style={styles.text}>{user_name}</Text>
            <Text style={styles.offlineText}> OFFLINE</Text>
        </View>
        <View>
            <View style={styles.gameTitleContainer}>
                <View style={styles.tagContainer}>
                    <Text style={styles.details}>{game_name}</Text>
                </View>
            </View>
            <View>
                <Text style={styles.titletext}>{title}</Text>
            </View>
        </View>
    </Pressable>
    :
    <StreamCard
        title={streamDetails?.title}
        user_id={streamDetails?.user_id}
        user_login={streamDetails?.user_login}
        game_name={streamDetails?.game_name}
        viewer_count={streamDetails?.viewer_count}
        is_mature={streamDetails?.is_mature}
        started_at={streamDetails?.started_at}
        thumbnail_url={streamDetails?.thumbnail_url}
        tags={streamDetails?.tags}
        user_name={streamDetails?.user_name}
        id={streamDetails?.id}
    />
    }
    </>
    )
}

export default SearchStreamCard

const styles = StyleSheet.create({
    container:{
        margin: 8,
        backgroundColor: Colors.twitchBlack1000,
        padding: 3,
        borderRadius: 5,

    },
    DetailsContainer:{
        flexDirection: "row",
        alignItems: "center",
    },
    gameTitleContainer:{
        flexDirection: "row",
        marginBottom: 5,
        marginTop: 5,
    },
    text:{
        color: Colors.twitchWhite1000,
        fontSize: 14,
        fontWeight: "bold",
        wordWrap: "break-word",
    },
    titletext:{
        color: Colors.twitchBlack700,
        fontSize: 13,
        marginBottom: 10,
        wordWrap: "break-word",
    },
    offlineText:{
        color: Colors.twitchBlack800,
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 10,
    },
    profileImage:{
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: 10,
    },
    tagContainer:{
        flexDirection: "row",
        marginBottom: 3,
        marginTop: 3,
    },
    details:{
        fontWeight: "bold",
        textAlign: "left",
        color: Colors.twitchBlack700,
    },
    onPress:{
        opacity: 0.75,
    }
})