import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { store } from '../../store';
import Slider from '@react-native-community/slider';
import Colors, { commonStyles } from '../../constants';
import { useSelector, useDispatch } from 'react-redux';
import { configSliceActions } from '../../store/Configuration/config-slice';

// CURRENTLY UNUSED, BUT MAY BE USED IN THE FUTURE
// This component allows users to adjust the maximum number of SyncEmotes cached in memory.
function EmoteCacheSize() {
    const dispatch = useDispatch();
    const maxEmoteCacheSize = useSelector((state) => state.config.maxEmoteCacheSize) || 250;

    const handleSlidingComplete = (value) => {
        dispatch(configSliceActions.setMaxEmoteCacheSize(value)); // Update Redux state when sliding is complete
    };

    return (
        <View style={commonStyles.settingsContainer}>
            <View style={styles.settingsRow}>
                <Text style={styles.subText}>Cache Anime Emotes Amount</Text>
            </View>
            <View style={styles.sliderContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={100}
                    maximumValue={2000}
                    step={100}
                    value={maxEmoteCacheSize}
                    onSlidingComplete={handleSlidingComplete} // Update Redux state
                    minimumTrackTintColor={Colors.twitchPurple1000}
                    maximumTrackTintColor={Colors.twitchWhite1000}
                    thumbTintColor={Colors.twitchPurple900}
                />
                <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={maxEmoteCacheSize.toString()}
                    editable={false}
                />
            </View>
            <View>
                <Text style={commonStyles.settingsText}>
                    If Sync Emotes is enabled, this will adjust the max number of emotes that are temporarily stored in memory.
                    Adjust this to avoid excessive memory usage or unforeseen crashes.
                </Text>
            </View>
        </View>
    );
}

export default EmoteCacheSize;

const styles = StyleSheet.create({
    subText: {
        color: Colors.twitchWhite1000,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    slider: {
        flex: 1,
        marginRight: 10,
    },
    textInput: {
        width: 60,
        height: 40,
        borderColor: Colors.twitchPurple1000,
        borderWidth: 1,
        borderRadius: 5,
        color: Colors.twitchWhite1000,
        textAlign: 'center',
        fontSize: 16,
    },
});