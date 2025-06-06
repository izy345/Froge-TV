import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View, Animated, Platform, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import IconButton from "../CustomIcons/IconButton";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants";
import TwitchExtension from "../../API/ExtensionAPI/twitch";
import profileAPI from "../../API/Profile";
import Icon from "../CustomIcons";
import StreamHeader from "./StreamHeader";
import ExpoPip from "expo-pip";
import { useIsFocused } from "@react-navigation/native";
import { configSliceActions } from "../../store/Configuration/config-slice";
import { useDispatch } from "react-redux";

function StreamFeed({ channelName, user_id }) {

    const { isInPipMode } = ExpoPip.useIsInPip();

    const dispatch = useDispatch();

    const isFocused = useIsFocused();
    
    const navigation = useNavigation();
    const twitchEmbedUrl = useMemo(() => {
    return `https://player.twitch.tv/?channel=${channelName}&parent=FrogeTV.com&autoplay=true`
    }, [channelName]);

    const headerAnim = useRef(new Animated.Value(-48)).current;

    const [streamDetails, setStreamDetails] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [timeSinceStart, setTimeSinceStart] = useState("");

    useEffect(() => {
        const getStreamDetails = async () => {
            const response = await TwitchExtension.getStreamDetails(user_id);
            //console.log("[StreamFeed]:", response);
            console.log('url:', twitchEmbedUrl);
            if (response) {
                setStreamDetails(response);
            }
    
            const { profile_image_url } = await profileAPI.getUserDetails(user_id);
            if (profile_image_url) {
                setProfileImageUrl(profile_image_url);
            }
        };
        // Run immediately on mount.
        getStreamDetails();
        // Then run every 8 minutes.
        const intervalId = setInterval(getStreamDetails, 300000);
        return () => clearInterval(intervalId);
    }, [user_id]);

    // The injected JS (unchanged)
    const injectedJS = useMemo(() => { 
        return `
            (function() {
                // existing style injection logic
                var style = document.createElement('style');
                style.innerHTML = '.ScCoreButton-sc-ocjdkq-0.gFvFah, .ScCoreButton-sc-ocjdkq-0.yKpkn, .Layout-sc-1xcs6mc-0.dquNzJ.top-bar, .InjectLayout-sc-1i43xsx-0.hWukFy.tw-transition-group { display: none !important; }';
                document.head.appendChild(style);

                // Disable all anchor clicks
                document.querySelectorAll('a').forEach(function(a) {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                });
                });

                //Check if the video player element exists
                function checkForPlayer() {
                    var player = document.querySelector('.video-player__inactive');
                    if (player) {
                        window.ReactNativeWebView.postMessage('player-absent');
                    } else {
                        window.ReactNativeWebView.postMessage('player-present');
                    }
                }
                // Perform an initial check and then every 900ms
                checkForPlayer();
                setInterval(checkForPlayer, 900);
            })();
            true;
    `},[])

    const [headerVisible, setHeaderVisible] = useState(false);

    const handleMessage = useCallback((event) => {
        const data = event.nativeEvent.data;
        if (data === "player-present") {
            setHeaderVisible(true);
            Animated.timing(headerAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start()
        } else if (data === "player-absent") {
            Animated.timing(headerAnim, {
                toValue: -48,
                duration: 150,
                useNativeDriver: true,
            }).start(
                () => {
                    setHeaderVisible(false);
                }
            );
        }
    }, [headerVisible]);

    const webViewRef = useRef(null);

    // dispatch PIP route when the user navigates back (disable automatic PIP and re-route)
    const handleBackPress = useCallback(() => {
        dispatch(configSliceActions.setPipRouteAndroid({
            route: {channelId: user_id, channelLogin: channelName },
            enabledOn: null,
            streamURL: twitchEmbedUrl,
        }))
        navigation.goBack();
    }, [navigation])
    useEffect(() => {
        const onHardwareBackPress = () => {
            handleBackPress();
            return true; // prevent default behavior
        };

        BackHandler.addEventListener("hardwareBackPress", onHardwareBackPress);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", onHardwareBackPress);
        };
    }, [handleBackPress]);

    // formatted title
    const formatTitle = useCallback((str) => {
        if (!str) return `${channelName} is currently offline`;
        return str.length > 110 ? str.substring(0, 120) + "..." : str;
    }, []);
    
    const formatGameName = useCallback((str) => {
        if (!str) return " - ";
        return str.length > 30 ? str.substring(0, 110) + "..." : str;
    }, []);

    const formatViewerCount = useCallback((count) => {
        // Convert count to string and insert a space every 3 digits (from the right side)
        return count ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "OFFLINE";
    },[]);

    // Update elapsed time every second
    useEffect(() => {
        if (!streamDetails || !streamDetails.started_at) {
            setTimeSinceStart("00:00:00");
            return
        }
        const startTime = new Date(streamDetails.started_at);
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
    }, [streamDetails?.started_at]);

    
    useEffect ( () => {
        if ( Platform.OS === "android") {
            console.log("Setting PIP params");
            ExpoPip.setPictureInPictureParams({
                width: 150,
                height: 84,
                eamlessResizeEnabled: true,
                autoEnterEnabled: true,
                title: "FrogeTV",
                
            });
            dispatch(configSliceActions.setPipRouteAndroid({
                route: {channelId: user_id, channelLogin: channelName },
                enabledOn: 'PIP',
                streamURL: twitchEmbedUrl,
            }))
        }
        return () => {
            if (Platform.OS === "android") {
                console.log("Removing PIP params");
                ExpoPip.setPictureInPictureParams({
                    autoEnterEnabled: false,
                    eamlessResizeEnabled: true,
                    width: 150,
                    height: 84,
                });
            }
        }

    },[isFocused, twitchEmbedUrl])

    return (
        <View
            style={styles.container}
            pointerEvents="box-none"
        >
            <View style={styles.subContainer} pointerEvents="box-none">
                <View style={styles.webViewContainer} pointerEvents="box-none">
                <WebView
                    ref={webViewRef}
                    source={{ uri: twitchEmbedUrl }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    injectedJavaScriptBeforeContentLoaded={injectedJS}
                    onLoadEnd={() => {
                        webViewRef.current.injectJavaScript(injectedJS);
                    }}
                    onMessage={handleMessage}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsFullscreenVideo={true}
                    allowsPictureInPictureMediaPlayback={true}
                    userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36"
                    onShouldStartLoadWithRequest={(request) => {
                        // If the request URL is not your allowed URL, return false
                        if (!request.url.startsWith("https://player.twitch.tv/")) {
                            return false;
                        }
                        return true;
                    }}
                />
                </View>
                {headerVisible && (
                <StreamHeader
                    handleBackPress={handleBackPress}
                    formatTitle={formatTitle(streamDetails?.title)}
                    formatGameName={formatGameName(streamDetails?.game_name)}
                    formatViewCount={formatViewerCount(streamDetails?.viewer_count)}
                    timeSinceStart={timeSinceStart}
                    profileImageUrl={profileImageUrl}
                    headerAnim={headerAnim}
                />
            )}
            </View>
        </View>
    );
}

export default StreamFeed;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    subContainer:{
        flex: 1,
    },
    webViewContainer: {
        zIndex:11,
        flex: 1,
        position: 'relative'
    },
    webview: {
        flex: 1,
    },
});
