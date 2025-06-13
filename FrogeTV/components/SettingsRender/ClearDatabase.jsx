import React, { use } from 'react'
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import Colors, { commonStyles } from '../../constants'
import SwitchToggle from '../../ui/SwitchToggle'
import { useSelector, useDispatch } from 'react-redux'
import { configSliceActions } from '../../store/Configuration/config-slice'
import { clearDatabase } from '../../database'

function ClearDatabase() {

    const handleButtonPress = () => {
        Alert.alert(
            "Clear Database",
            "Are you sure you want to clear the local database?",
            [
                {
                    text: "Yes",
                    onPress: () => clearDatabase()
                },
                {
                    text: "No",
                },

            ]
        );
    }


    return (
    <View style={commonStyles.settingsContainer}>
        <View style={styles.settingsRow}>
                <Text style={styles.subText}>
                    Clear Database
                </Text>
                    <Pressable style={({pressed}) => [
                        styles.button, pressed && {opacity: 0.5}]}
                        onPress={() => handleButtonPress()}
                    >
                    
                    <Text style={styles.text}>
                        Clear
                    </Text>
                </Pressable>
        </View>
        <View>
            <Text style={commonStyles.settingsText}>
                Clears the database used to store syncronized emotes.
                App will need to encode animated emotes again if cleared.
                The amount of storage used is limited by the setting 'Cache Anime Emote Amount'.
            </Text>
        </View>
    </View>
    )
}

export default ClearDatabase

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
    button:{
        borderColor: Colors.twitchPurple1000,
        borderWidth: 1.1,
        borderRadius: 5,
    },
    text:{
        color: Colors.twitchWhite1000,
        fontSize: 16,
        padding: 10,
    }
})