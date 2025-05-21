import{ Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IconButton({icon='md-add', size=24, color='white', onPress = () => {}}) {
    return(
        <Pressable 
            style={({pressed}) => 
                pressed && styles.pressed
            }
            onPress={ () => onPress() }
        >
            <View style={styles.buttonContainer}>
                <Ionicons name={icon} size={size} color={color} />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    buttonContainer:{
        //flex:1,
        padding: 4,
        marginVertical: 4,
        marginHorizontal: 8,
    },
    pressed:{
        opacity: 0.5,
    }
});