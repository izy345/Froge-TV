import { StyleSheet, Text, View, Image, Animated } from "react-native";
import IconButton from "../CustomIcons/IconButton";
import Colors from "../../constants";
import { useSelector } from "react-redux";
import Icon from "../CustomIcons";

function StreamHeader({headerAnim, profileImageUrl, formatTitle, formatGameName, formatViewCount, timeSinceStart, handleBackPress=() => {}}) {
    

    const phoneIsPotrait = useSelector( (state) => state.phone.phoneIsPotrait);

    return(
    <>
    { phoneIsPotrait === true ? 
        <>
            <View style={styles.potraitBackButtonContainer}>
                <IconButton
                    icon="arrow-back"
                    size={25}
                    color="white"
                    onPress={handleBackPress}
                />
            </View>
            <Animated.View
                style={[
                    styles.potraitHeaderContainer,
                    {transform: [{ translateY: headerAnim }]},
                ]}
                pointerEvents="box-none"
            >
                <View style={styles.streamDetailsContainer}>
                    <View>
                        {profileImageUrl && (
                            <Image
                                source={{ uri: profileImageUrl }}
                                style={styles.potraitProfileImage}
                            />
                        )}
                    </View>
                    <View style={styles.potraitTextHeaderContainer}>
                        <View>
                            <Text style={styles.textHeader}> {formatTitle}</Text>
                        </View>
                        <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                            <Text style={styles.textHeader}> {formatGameName}   </Text>
                            <View style={styles.flexRow}>
                                <Icon icon='people' size={13} color={Colors.twitchWhite1000} />
                                <Text style={styles.textHeader}> {formatViewCount}   </Text>
                            </View>
                            <View style={styles.flexRow}>
                                <Icon icon='radio-button-on' size={13} color={Colors.twitchRed1000} />
                                <Text style={styles.textHeader}> {timeSinceStart}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </>
        :
        <View 
            style={styles.headerContainer}
            pointerEvents="box-none"
        >
            <View style={styles.streamDetailsContainer}>
                <View>
                    {profileImageUrl && (
                        <Image
                            source={{ uri: profileImageUrl }}
                            style={styles.profileImage}
                        />
                    )}
                </View>
                <View style={styles.textHeaderContainer}>
                    <View>
                        <Text style={styles.textHeader}> {formatTitle}</Text>
                    </View>
                    <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                        <Text style={styles.textHeader}> {formatGameName}   </Text>
                        <View style={styles.flexRow}>
                            <Icon icon='people' size={13} color={Colors.twitchWhite1000} />
                            <Text style={styles.textHeader}> {formatViewCount}   </Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Icon icon='radio-button-on' size={13} color={Colors.twitchRed1000} />
                            <Text style={styles.textHeader}> {timeSinceStart}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.backButtonContainer}>
                <IconButton
                    icon="arrow-back"
                    size={25}
                    color="white"
                    onPress={handleBackPress}
                />
            </View>
        </View>
    }
    </>
    )

}

export default StreamHeader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    subContainer:{
        flex: 1,
        zIndex: 99,
    },
    webview: {
        flex: 1,
    },
    headerContainer: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 11,
        width: '82%',
    },
    potraitHeaderContainer: {
        position: "absolute",
        bottom: -75,
        left: 0,
        zIndex: 10,
        width: '100%',
        height: 75,
        paddingTop: 4,
        borderBottomWidth: 2,
        borderBottomColor: Colors.twitchPurple1000,
        backgroundColor: Colors.twitchBlack1000,
        },
    textHeaderContainer:{
        backgroundColor: "rgba(0, 0, 0, 0.25)",
    },
    potraitTextHeaderContainer:{
        paddingBottom: 10,
        borderRadius: 10,
        width: '82%',
        maxWidth: '82%',
        // shadow
        shadowColor: Colors.twitchBlack1000,
        shadowOffset: {
            width: 0,
            height: 4, 
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
        },
    textHeader: {
        color: Colors.twitchWhite1000,
        flexWrap: "wrap",
        flexShrink: 1, // add this to allow wrapping
        fontSize: 11,
        fontWeight: "bold",
    },
    potraitBackButtonContainer: {
        position: "absolute",
        top: 10,
        left: 0,
        zIndex: 20,
    },
    backButtonContainer: {
        position: "absolute",
        top: 37,
        left: -8,
        zIndex: 10,
        },
    streamDetailsContainer:{
        flexDirection: "row",
        alignItems: "flex-start",

    },
    flexRow:{
        flexDirection: "row",
    },
    profileImage:{
        width: 37,
        height: 37,
        borderRadius: 20,
        marginRight: 10,
    },
    potraitProfileImage:{
        width: 45,
        height: 45,
        borderRadius: 20,
        marginRight: 10,
    },
});
