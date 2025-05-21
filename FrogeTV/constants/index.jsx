import { StyleSheet } from 'react-native';

const Colors = {
    twitchPurple1000: "#6441a5",
    twitchPurple1000Transparent: "#6441a55e",
    twitchPurple900: "#b9a3e3",
    twitchPurple900Transparent: "#b9a3e316",
    twitchBlack1000: "#070707",
    oledBlack: "#000000",
    twitchWhite1000: "#f1f1f1",
    twitchBlack950: "#1d1d1d",
    twitchBlack950Transparent: "#1d1d1d68",
    twitchBlack900: "#424242",
    twitchBlack800: "#535353",
    twitchBlack700: "#a0a0a0",
    twitchRed1000: "#c53121",
    twitchRed1000Transparent: "#c5312150",
    twitchRed900Transparent: "#e03d3150",
};

export const scopes = [
    "user:read:email",
    "chat:edit",
    "chat:read",
    "user:write:chat",
    "channel:moderate",
    "channel:read:redemptions",
    "channel:manage:redemptions",
    "channel:manage:broadcast",
    "user_subscriptions",
    "whispers:read",
    "whispers:edit",
    "user:read:follows",
    "user_blocks_edit",
    "user_blocks_read",
    "user:read:blocked_users",
    "user:read:emotes",
    "user:manage:blocked_users",
    "channel_editor",
];


export default Colors;

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    containerPadding:{
        flex: 1,
        padding: 16,
    },
    tagContainer:{
        borderRadius: 8,
        backgroundColor: Colors.twitchBlack900,
        marginLeft: 8,
        paddingHorizontal: 8,
    },
    header: {
        fontSize: 24,
        color: Colors.twitchWhite1000,
        marginBottom: 10,
        textAlign: "center",
    },
    text: {
        fontSize: 16,
        color: Colors.twitchWhite1000,
        marginBottom: 20,
        textAlign: "center",
    },
    settingsContainer:{
        backgroundColor: Colors.twitchBlack950,
        width: '97%',
        marginLeft: '1.5%',
        marginRight: '1.5%',
        borderRadius: 10,
        marginBottom: 5,
        marginTop: 5
    },
    settingsText:{
        color: Colors.twitchBlack700,
        fontSize: 14,
        paddingRight: 5,
        paddingBottom: 5,
        marginTop: 10,
        marginLeft: 20,
    }
});
