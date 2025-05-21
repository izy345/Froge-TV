import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { authSliceActions } from "../../store/AuthSlice/auth-slice";
import { CLIENT_ID } from "../../API";
import Colors, { scopes } from "../../constants";
import { saveToken } from "../../secure";
import request from "../../API";



const redirectUri = "http://localhost:3000/";
const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes.join(" "))}`;

function CheckAuth() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const showLoginBanner = useSelector((state) => state.auth.showLoginBanner);
    const userId = useSelector((state) => state.auth.userId);

    // local state to know if we've timed out waiting for login
    const [loginTimedOut, setLoginTimedOut] = useState(false);

    useEffect(() => {
        if (showLoginBanner) {
            // Start a 4-second timer. If no login (userId remains empty), mark as timed out.
            const timer = setTimeout(() => {
                if (!userId) {
                    setLoginTimedOut(true);
                    // additional logic for a "not logged in" scenario.
                    dispatch(authSliceActions.setAccessToken(""));
                    dispatch(authSliceActions.setUserId(""));
                    dispatch(authSliceActions.setIsLoggedin(false));
                    dispatch(authSliceActions.setShowLoginBanner(false));
                    navigation.replace("Login");
                }
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showLoginBanner, userId]);

    const handleNavigationStateChange = async (navState) => {
        console.log("Navigation State Change:", navState.url);
        if (navState.url.startsWith(redirectUri)) {
            const urlParts = navState.url.split("#");
            if (urlParts.length > 1) {
                const params = new URLSearchParams(urlParts[1]);
                const access_token = params.get("access_token");
                if (access_token) {
                    // Save the token securely
                    await saveToken("access_token", access_token);
                    dispatch(authSliceActions.setAccessToken(access_token));
                    dispatch(authSliceActions.setIsLoggedin(true));
                    // Fetch user information (for example, to obtain the userId)
                    try {
                        const response = await request("get", "users");
                        const fetchedUserId = response.data.data[0].id;
                        await saveToken("user_id", fetchedUserId);
                        dispatch(authSliceActions.setUserId(fetchedUserId));
                        dispatch(authSliceActions.setUserName(response.data.data[0].login));
                        dispatch(authSliceActions.setShowLoginBanner(false));
                        //navigation.navigate("HomeRoutes");
                    } catch (error) {
                        dispatch(authSliceActions.setAccessToken(""));
                        dispatch(authSliceActions.setUserId(""));
                        dispatch(authSliceActions.setIsLoggedin(false));
                        dispatch(authSliceActions.setShowLoginBanner(false));
                        //navigation('Login')
                        console.warn("Error fetching user info:", error);
                    }
                }
            }
        }
    };

    return (
        <Modal visible={showLoginBanner} transparent animationType="slide">
            <View style={styles.container}>
                {/* Hidden WebView */}
                <WebView
                    source={{ uri: authUrl }}
                    onNavigationStateChange={handleNavigationStateChange}
                    style={styles.hiddenWebView}
                />
                {loginTimedOut ? (
                    <View style={styles.timedOutContainer}>
                        <Text style={styles.timedOutText}>
                            Automatic authentication failed.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.bannerContainer}>
                        <Text style={styles.bannerText}>
                            Authenticating with twitch...
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );
}

export default CheckAuth;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    bannerContainer: {
        backgroundColor: Colors.twitchPurple1000,
        width: "100%",
        padding: 10,
        alignItems: "center",
    },
    bannerText: {
        color: "white",
        fontWeight: "bold",
    },
    hiddenWebView: {
        position: "absolute",
        top: -1000,
        width: 0,
        height: 0,
    },
    timedOutContainer: {
        backgroundColor: Colors.twitchRed1000,
        width: "100%",
        padding: 20,
        alignItems: "center",
    },
    timedOutText: {
        color: Colors.twitchWhite1000,
        fontWeight: "bold",
    },
});
