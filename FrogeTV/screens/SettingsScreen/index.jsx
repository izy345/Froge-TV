import { View, Text, StyleSheet } from "react-native"
import SettingsRender from "../../components/SettingsRender"
import { commonStyles } from "../../constants"

function Settings() {
    return (
        <View style={{flex: 1}}>
            <SettingsRender />
        </View>
    )
}

export default Settings
