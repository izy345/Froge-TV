import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

// currently an experimental feature, more work required for proper efficiency and performance
function SyncEmote() {

    const dispatch = useDispatch();

    const attemptEmoteSync = useSelector((state) => state.config.attemptEmoteSync);
    
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Sync Emote Playback Hack
                </Text>
                <SwitchToggle
                    value={attemptEmoteSync}
                    setValue={() => {dispatch(configSliceActions.setAttemptEmoteSync(!attemptEmoteSync))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                The Image APIs available in React Native have no support for frame manipulation.
                This hack will attempt to sync the playback of emotes in chat by using a 'hacky' solution. 
                This option also fixes ghosting issues with emotes that you may encounter in ios.
                May cause performance to be degraded. Needs more work and testing. 
            </Text>
        </View>
    </View>
    )
}

export default SyncEmote

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