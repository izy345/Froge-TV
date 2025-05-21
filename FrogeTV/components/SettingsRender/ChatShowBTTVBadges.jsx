import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function ChatShowBTTVBadges() {

    const dispatch = useDispatch();

    const showBTTVBadges = useSelector((state) => state.config.showBTTVBadges);
    
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Show BTTV Badges
                </Text>
                <SwitchToggle
                    value={showBTTVBadges}
                    setValue={() => {dispatch(configSliceActions.setShowBTTVBadges(!showBTTVBadges))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Show badges from BetterTwitchTV (BTTV) next to the username in chat.
            </Text>
        </View>
    </View>
    )
}

export default ChatShowBTTVBadges

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