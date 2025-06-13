import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function EmoteSyncImplementation() {

    const dispatch = useDispatch();

    const EmoteSyncUseDatabase = useSelector((state) => state.config.EmoteSyncUseDatabase);
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Use Local Database 
                </Text>
                <SwitchToggle
                    value={EmoteSyncUseDatabase}
                    setValue={() => {dispatch(configSliceActions.setEmoteSyncUseDatabase(!EmoteSyncUseDatabase))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                If activated, an in-device database will be used to save syncronized emotes to storage locally. 
                If deactivated, the app will use RAM to store the syncronized emotes for the current session only.
                The database will respect 'Cache Anime Emoute Amount' and 'Diverge Requirement' settings.
                please modify those settings to adjust how much storage you want the app to use. 
            </Text>
        </View>
    </View>
    )
}

export default EmoteSyncImplementation

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