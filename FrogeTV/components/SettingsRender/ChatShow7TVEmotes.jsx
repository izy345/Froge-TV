import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function ChatShow7TVEmotes() {

    const dispatch = useDispatch();

    const show7TVEmotes = useSelector((state) => state.config.show7TVEmotes);
    
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Show Emotes from 7TV
                </Text>
                <SwitchToggle
                    value={show7TVEmotes}
                    setValue={() => {dispatch(configSliceActions.setShow7TVEmotes(!show7TVEmotes))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Show Emotes from 7TV in chat.
            </Text>
        </View>
    </View>
    )
}

export default ChatShow7TVEmotes

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