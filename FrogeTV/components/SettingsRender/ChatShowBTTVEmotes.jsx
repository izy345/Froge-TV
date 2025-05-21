import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function ChatShowBTTVEmotes() {

    const dispatch = useDispatch();

    const showBTTVEmotes = useSelector((state) => state.config.showBTTVEmotes);
    
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Show Emotes from BTTV
                </Text>
                <SwitchToggle
                    value={showBTTVEmotes}
                    setValue={() => {dispatch(configSliceActions.setShowBTTVEmotes(!showBTTVEmotes))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Show Emotes from BetterTwitchTV (BTTV) in chat.
            </Text>
        </View>
    </View>
    )
}

export default ChatShowBTTVEmotes

const styles = StyleSheet.create({
    subText:{
        color: Colors.twitchWhite1000,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,

    },
    settingsRow:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
})