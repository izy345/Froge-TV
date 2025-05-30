import React from 'react'
import { Text, StyleSheet, ScrollView, View } from 'react-native'
import Colors from '../../constants'
import ChatScrollAnimation from './ChatScrollAnimation'
import ChatHideDeletedMsgs from './ChatHideDeletedMsgs'
import ChatShowBTTVBadges from './ChatShowBTTVBadges'
import ChatShowFFZBadges from './ChatShowFFZBadges'
import ChatShowBTTVEmotes from './ChatShowBTTVEmotes'
import ChatShowFFZEmotes from './ChatShowFFZEmotes'
import ChatShow7TVEmotes from './ChatShow7TVEmotes'
import VersionInfo from './VersionInfo'
import SyncEmote from './SyncEmotes'
//import EmoteCacheSize from './EmoteCacheSize'

function SettingsRender() {
    return (
    <ScrollView style={{flex:1}}>
        <Text style={styles.boldText}> Chat</Text>
        <ChatScrollAnimation />
        <ChatHideDeletedMsgs />
        <ChatShowBTTVBadges />
        <ChatShowFFZBadges />
        <ChatShowBTTVEmotes />
        <ChatShowFFZEmotes />
        <ChatShow7TVEmotes />
        <Text style={styles.boldText}> Experimental</Text>
        <SyncEmote />
        <VersionInfo />
    </ScrollView>
    )
}

export default SettingsRender

const styles = StyleSheet.create({
    boldText:{
        color: Colors.twitchWhite1000,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,
    },
})