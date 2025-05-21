import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function ChatHideDeletedMsgs() {

    const dispatch = useDispatch();

    const hideDeletedMessages = useSelector((state) => state.config.hideDeletedMessages);
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Hide Deleted Messages
                </Text>
                <SwitchToggle
                    value={hideDeletedMessages}
                    setValue={() => {dispatch(configSliceActions.setHideDeletedMessages(!hideDeletedMessages))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Hides deleted messages in chat with 'message deleted'. Turn this on to avoid seeing potential spam and offensive messages.
            </Text>
        </View>
    </View>
    )
}

export default ChatHideDeletedMsgs

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