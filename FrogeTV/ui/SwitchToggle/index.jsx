import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import Colors from "../../constants";

export default function SwitchToggle({
    value,
    setValue,
    disabled = false,
    ...rest
}) {
    return (
        <View style={styles.container}>
            <Switch
                value={value}
                onValueChange={setValue}
                disabled={disabled}
                trackColor={{ false: "#909090", true: Colors.twitchPurple1000 }}
                thumbColor={value ? 'white' : Colors.twitchPurple900}
                {...rest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 55,
    },
});
