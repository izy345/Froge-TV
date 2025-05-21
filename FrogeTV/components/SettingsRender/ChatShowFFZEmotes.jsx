import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function ChatShowFFZEmotes() {

    const dispatch = useDispatch();

    const showFFZEmotes = useSelector((state) => state.config.showFFZEmotes);
    
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Show Emotes from FFZ
                </Text>
                <SwitchToggle
                    value={showFFZEmotes}
                    setValue={() => {dispatch(configSliceActions.setShowFFZEmotes(!showFFZEmotes))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Show Emotes from FrankerFaceZ (FFZ) in chat.
            </Text>
        </View>
    </View>
    )
}

export default ChatShowFFZEmotes

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