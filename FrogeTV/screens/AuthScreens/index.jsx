import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { View, Text, StyleSheet, Button, Modal, Platform } from "react-native";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import { commonStyles } from "../../constants";
import { saveToken } from "../../secure";
import { useDispatch, useSelector } from "react-redux";
import { authSliceActions } from "../../store/AuthSlice/auth-slice";
import request from "../../API";
import { CLIENT_ID } from "../../API";
import { scopes } from "../../constants";

const twitchClientId = CLIENT_ID;
const redirectUri = "http://localhost:3000/";
const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
)}&response_type=token&scope=${encodeURIComponent(scopes.join(" "))}`;

export default function AuthScreen({ navigation }) {
    const dispatch = useDispatch();
    const isloggedIn = useSelector((state) => state.auth.isloggedIn);
    const pipRouteAndroid = useSelector((state) => state.config.pipRouteAndroid);
    const [showWebView, setShowWebView] = useState(false);
    const timerRef = useRef(null);

    // Check if the user should be redirected to a specific route after PIP mode on Android.
    const checkPIPRouteAndroid = () => {
        try{
            if (pipRouteAndroid && Platform.OS === "android") {
                if (pipRouteAndroid.enabledOn != null && pipRouteAndroid.enabledOn !== "PIP") {
                    const enabledTime = new Date(pipRouteAndroid.enabledOn);
                    const currentTime = new Date();
                    const diffSeconds = (currentTime - enabledTime) / 1000;

                    // Check if the difference is less than 5 seconds since PIP mode was enabled.
                    if (diffSeconds < 5) {
                        navigation.reset({
                            index: 1,
                            routes: [
                                { name: "HomeRoutes" },
                                {
                                    name: "Stream",
                                    params: {
                                        channelName: "",
                                        channelLogin: pipRouteAndroid.route.channelLogin,
                                        channelId: pipRouteAndroid.route.channelId,
                                    },
                                },
                            ],
                        });
                    }
                // if enabledOn is null (), we check if we have a valid route and if the last state was PIP
                } else if (pipRouteAndroid.enabledOn === "PIP" && pipRouteAndroid.route != null) {
                    // enabledOn is null but we have a valid route, so navigate regardless.
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: "HomeRoutes" },
                            {
                                name: "Stream",
                                params: {
                                    channelName: "",
                                    channelLogin: pipRouteAndroid.route.channelLogin,
                                    channelId: pipRouteAndroid.route.channelId,
                                },
                            },
                        ],
                    });
                }
            }
        }catch (error) {
            return
        }
    }

    useLayoutEffect(() => {
        checkPIPRouteAndroid()
    }, [pipRouteAndroid, navigation]);

    // When user is logged in, we want to initiate the background authentication check:
    useEffect(() => {
        if (isloggedIn) {
            // Show the modal and start the 4-second timer.
            setShowWebView(true);
            timerRef.current = setTimeout(() => {
                console.log(
                    "4 seconds passed without redirection; forcing logout"
                );
                dispatch(authSliceActions.setIsLoggedin(false));
                setShowWebView(false);
            }, 4000);
        } else {
            // If not logged in, hide the WebView.
            setShowWebView(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
        // Cleanup the timer on unmount or when isloggedIn changes.
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isloggedIn, dispatch]);

    const handleNavigationChange = async (navState) => {
        if (navState.url.startsWith(redirectUri)) {
            // Cancel the fallback timer since we got a redirect.
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            const urlParts = navState.url.split("#");
            if (urlParts.length > 1) {
                const params = new URLSearchParams(urlParts[1]);
                console.log("URL Params:", params.toString());
                const access_token = params.get("access_token");
                if (access_token) {
                    console.log("Access Token:", access_token);
                    // Save the token securely and update Redux.
                    await saveToken("access_token", access_token);
                    dispatch(authSliceActions.setAccessToken(access_token));
                    dispatch(authSliceActions.setIsLoggedin(true));
                    // Fetch user information.
                    try {
                        const response = await request("get", "users");
                        console.log("User Info Response:", response.data.data);
                        dispatch(authSliceActions.setUserName(response.data.data[0].login));  
                        await saveToken("user_id", response.data.data[0].id);
                        dispatch(
                            authSliceActions.setUserId(response.data.data[0].id)
                        );
                    } catch (error) {
                        console.error("Error fetching user info:", error);
                    }
                    
                    navigation.replace("HomeRoutes");
                    
                }
            }
            // Hide the modal (whether redirection was successful or not).
            setShowWebView(false);
        }
    };

    return (
        <View style={commonStyles.container}>
            {/* Normal UI when user is not already authenticated */}
            {!isloggedIn ? (
                <>
                    <Text style={commonStyles.header}>Log in with Twitch</Text>
                    <Text style={commonStyles.text}>
                        FrogeTV needs permissions to handle all Twitch-related
                        features. You can review all required permissions before
                        accepting.
                    </Text>
                    <Image
                        source={{
                            uri: "https://cdn.7tv.app/emote/01F2ZWD6CR000DSBG200DM9SGM/4x.webp",
                        }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    <Button
                        title="Connect with Twitch"
                        onPress={() => setShowWebView(true)}
                    />
                    <View style={{ marginTop: 20 }}>
                        <Text style={commonStyles.text}>
                            Please note that Twitch doesn't directly support
                            native apps. So you might need to force shutdown the
                            app to try again.
                        </Text>
                    </View>
                </>
            ) : (
                <>
                    <Image
                        source={{
                            uri: "https://cdn.7tv.app/emote/01F2ZWD6CR000DSBG200DM9SGM/4x.webp",
                        }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    <Text style={commonStyles.header}>Loading...</Text>
                    <Text style={commonStyles.text}>
                        Please wait while we set up your account.
                    </Text>
                </>
            )}
            {/* Background (invisible) Modal for automatic authentication */}
            <Modal visible={showWebView} animationType="slide" transparent>
                <View
                    style={
                        isloggedIn
                            ? styles.hiddenWebViewContainer
                            : styles.modalContainer
                    }
                >
                    <WebView
                        source={{ uri: authUrl }}
                        onNavigationStateChange={handleNavigationChange}
                        startInLoadingState
                        javaScriptEnabled={true}
                        sharedCookiesEnabled={true}
                        thirdPartyCookiesEnabled={true}
                        injectedJavaScript={`
                        // Browser spoofing
                        window.chrome = { 
                            runtime: {},
                            app: { isInstalled: false },
                            loadTimes: function() {},
                            csi: function() {},
                            webstore: {}
                        };
                        Object.defineProperty(navigator, 'platform', { get: () => 'Windows' });
                        Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
                        Object.defineProperty(navigator, 'webdriver', { get: () => false });
                        Object.defineProperty(navigator, 'plugins', { get: () => new Array(5) });
                        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
                        if (!window.Notification) { window.Notification = { permission: 'denied' }; }
                        true;
                        `}
                    />
                    {/* Optional Cancel button if you want to allow manual cancellation */}
                    {!isloggedIn && (
                        <Button
                            title="Cancel"
                            onPress={() => setShowWebView(false)}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "white", // visible background for login flow
    },
    hiddenWebViewContainer: {
        // When logged in, the container takes minimal space so the user doesn't see the WebView.
        height: 0,
        overflow: "hidden",
    },
});
