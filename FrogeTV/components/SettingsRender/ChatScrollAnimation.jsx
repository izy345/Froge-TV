import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'

function ChatScrollAnimation() {

    const dispatch = useDispatch();

    const chatScrollAnimationIsActive = useSelector((state) => state.config.chatScrollAnimationIsActive);
    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Smooth Scroll Animation
                </Text>
                <SwitchToggle
                    value={chatScrollAnimationIsActive}
                    setValue={() => {dispatch(configSliceActions.setChatScrollAnimationIsActive(!chatScrollAnimationIsActive))}}
                    disabled={false}
                />
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Enables a smooth scroll animation when new messages are received in chat at the cost of some optimization.
            </Text>
        </View>
    </View>
    )
}

export default ChatScrollAnimation

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