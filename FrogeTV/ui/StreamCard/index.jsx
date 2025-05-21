import { View, Text, StyleSheet, Image, Pressable, useWindowDimensions } from "react-native"
import Colors, { commonStyles } from "../../constants" 
import { useLayoutEffect, useEffect, useState, useCallback, useMemo } from "react";
import profileAPI from "../../API/Profile";
import Icon from "../CustomIcons";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cacheSliceActions, getStreamCardURL } from "../../store/cache/cache-slice";

function StreamCard({
    forcePotraitMode = false,
    title,
    user_id,
    user_name = '?',
    user_login,
    game_name,
    viewer_count,
    is_mature,
    started_at,
    thumbnail_url,
    tags,
    id,
    thumbnail_width = 1180,
    thumbnail_height = 620}) {

    const dispatch = useDispatch();
    
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    const phoneIsPotrait = useSelector( (state) => state.phone.phoneIsPotrait);

    const profileImageCache = useSelector(getStreamCardURL(user_id))

    const { width: windowWidth, height: windowHeight } = useWindowDimensions()

    const insets = useSafeAreaInsets();
    
        // in some devices, specifically ipadOS, the hook useWindowDimensions
        // does not update when the device is rotated, so we need to use
        // the following code to get the screen width. Just inverted :)
        const screenWidth = useMemo(() => {
            const adjustedWidth = windowWidth - insets.left - insets.right;
            const adjustedHeight = windowHeight - insets.left - insets.right;
            if (windowWidth < windowHeight && !phoneIsPotrait) {
                return adjustedHeight;
            } else if (windowWidth > windowHeight && phoneIsPotrait) {
                return windowHeight - insets.left - insets.right;
            }
            return adjustedWidth;
        }, [windowWidth, windowHeight, phoneIsPotrait, insets]);


    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [timeSinceStart, setTimeSinceStart] = useState("");
    const [ formattedThumbnailUrl, setFormattedThumbnailUrl] = useState(thumbnail_url);

    useLayoutEffect(() => {
        const getUserprofile = async () => {
            if (profileImageCache) {
                setProfileImageUrl(profileImageCache);
                return;
            }
            const { profile_image_url } = await profileAPI.getUserDetails(user_id)
            if (profile_image_url) {
                setProfileImageUrl(profile_image_url);
                dispatch(cacheSliceActions.addStreamCardCache({
                    streamId: user_id,
                    profileImageUrl: profile_image_url,
                }))
            }
        }
        getUserprofile()
    },[user_id])


    // the following functions are formatters
    //const formattedThumbnailUrl = thumbnail_url.replace(/{width}x{height}/, `${thumbnail_width}x${thumbnail_height}`);

    const formatViewerCount = useCallback((count) => {
        // Convert count to string and insert a space every 3 digits (from the right side)
        return count ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "";
    },[]);

    // Dynamic font size for the title text.
    const titleFontSize = useMemo(() => {
        const defaultFontSize = 14;
        const len = title ? title.length : 0;
        if(len <= 90) return defaultFontSize;
        const excess = len - 90;
        // Reduce 0.2 per extra character, with a minimum font size of 10.
        let newSize = defaultFontSize - excess * 0.2;
        return newSize < 10 ? 10 : newSize;
    }, [title]);

    const formatTitle = useCallback((str) => {
        if (!str) return "";
        return str.length > 150 ? str.substring(0, 160) + "..." : str;
    },[])

    // Dynamic font size for the game name text.
    const gameFontSize = useMemo(() => {
        const defaultSize = 14; // default font size
        const minSize = 11;    // minimum allowed font size
        const lengthThreshold = 20; // characters before scaling is applied
        const extraChars = Math.max(game_name.length - lengthThreshold, 0);
        // Reduce font size by 0.3 for each extra character.
        let newSize = defaultSize - (extraChars * 0.5);
        return newSize < minSize ? minSize : newSize;
    }, [game_name]);

    const formatGameName = useCallback((str) => {
        if (!str) return "";
        return str.length > 40 ? str.substring(0, 50) + "..." : str;
    },[]);

    const fullName = useMemo(() => {
        try{
            return user_name + (user_name.toLowerCase() !== user_login.toLowerCase() ? ` (${user_login})` : "");
        } catch (error) {
            return user_name;
        }
    }, [user_name, user_login]);

    // Dynamically adjust font size based on length of fullName.
    const usernameFontSize = useMemo(() => {
        const defaultSize = 14; // default font size
        const minSize = 9;    // minimum allowed font size
        const lengthThreshold = 10; // characters before scaling is applied
        const extraChars = Math.max(fullName.length - lengthThreshold, 0);
        // Reduce font size by 0.3 for each extra character.
        let newSize = defaultSize - (extraChars * 0.5);
        return newSize < minSize ? minSize : newSize;
    }, [fullName]);

    useEffect(() => {
        if (isFocused){
            setFormattedThumbnailUrl(thumbnail_url
                .replace(/{width}x{height}/, `${thumbnail_width}x${thumbnail_height}`)
                + `?t=${Date.now()}`)
        }
    }, [isFocused, thumbnail_url, thumbnail_width, thumbnail_height]);

    // Update elapsed time every second
    useEffect(() => {
        const startTime = new Date(started_at);
        const updateTime = () => {
            const now = new Date();
            const diff = now - startTime; // difference in milliseconds
            const totalSeconds = Math.floor(diff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            setTimeSinceStart(
                `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };
        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [started_at]);



    // When the stream is clicked, navigate to the stream screen
    const handleStreamPress = useCallback(() => {
        navigation.navigate('Stream', {
            channelName: user_id,
            channelLogin: user_login,
            channelId: user_id,
        });
    },[navigation, user_name, user_id, user_login]);


    return (
        <View style={[styles.container,{width: screenWidth * 0.96} ,(phoneIsPotrait || forcePotraitMode) ? {maxWidth: 690} : {maxWidth: 390}]}>
            <View style={styles.headerContainer}>
            {profileImageUrl && (
                    <Image
                        source={{ uri: profileImageUrl }}
                        style={styles.profileImage}
                    />
                )}
                <Text style={[styles.details, { fontSize: usernameFontSize }]}>
                    {fullName}
                </Text>
                <View style={commonStyles.tagContainer}>
                    <Text style={[styles.details,{fontSize:gameFontSize}]}>{formatGameName(game_name)}</Text>
                </View>
            </View>
            <Pressable style={ ({pressed }) => [styles.streamDetailsContainer, pressed && styles.onPress]}
                onPress={() => {
                    handleStreamPress()
                }}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{uri: formattedThumbnailUrl}}
                        style={styles.thumbnail}
                    />
                </View>
                <View style={styles.detailsColumn}>
                    <View style={styles.timeContainer}>
                        <Icon icon='radio-button-on' size={15} color={Colors.twitchRed1000} />
                        <Text style={styles.detailText}> {timeSinceStart}</Text>
                        <View style={[commonStyles.tagContainer, styles.tagContainer]}>
                            <Icon icon='people' size={18} color={Colors.twitchBlack1000} />
                            <Text style={styles.details}> {formatViewerCount(viewer_count)}</Text>
                        </View>
                        
                    </View>
                    <Text style={[styles.detailText, { fontSize: titleFontSize }]}>{formatTitle(title)}</Text>
                    
                </View>
            </Pressable>
        </View>
    )
}

export default StreamCard


const styles = StyleSheet.create({
    container:{
        marginBottom: 20,
        margin: 5,
        minWidth: 300,
        height: 135,
        minHeight: 135,
        maxHeight: 135
    },
    onPress:{
        opacity: 0.75,
    },
    headerContainer:{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        flexWrap: "wrap",
    },
    streamDetailsContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    imageContainer: {
        width: 150,
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
    thumbnail:{
        width: 150,
        height: 100,
        borderRadius: 10,
        overflow: 'hidden',
    },
    details:{
        fontWeight: "bold",
        textAlign: "left",
        color: Colors.twitchWhite1000
    },
    detailsColumn: {
        flex: 1,
        paddingLeft: 10,
        justifyContent: "space-between",
    },
    detailText: {
        fontSize: 14,
        color: Colors.twitchWhite1000,
        marginBottom: 4,
    },

})