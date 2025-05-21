import { Text, StyleSheet, Pressable } from "react-native"
import Colors from "../../constants"

function ClickableText({onPress, isPressed, text}) {
    return (
    <Pressable
        onPress={onPress}
        style={({pressed}) => [
            {opacity: pressed ? 0.75 : 1},
        ]}
    
    >
        <Text
            style={ isPressed ? styles.textColorPressed : styles.textColor }
        >
            {text}
        </Text>
    </Pressable>
    )
}

export default ClickableText

const styles = StyleSheet.create({
    textColor:{
        color: Colors.twitchWhite1000
    },
    textColorPressed:{
        color: Colors.twitchPurple900
    }
})