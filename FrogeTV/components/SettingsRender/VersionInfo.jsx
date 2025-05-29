import React, { use } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors, { commonStyles } from '../../constants'


function VersionInfo() {

    
    return (
    <View style={[commonStyles.settingsContainer, {marginTop:30, marginBottom: 30, backgroundColor: Colors.twitchBlack1000}]}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    FrogeTV
                </Text>
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Current App Version: v1.0.1
            </Text>
            <Text style={commonStyles.settingsText}>
                Software Author: Israel G.
            </Text>
        </View>
    </View>
    )
}

export default VersionInfo

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