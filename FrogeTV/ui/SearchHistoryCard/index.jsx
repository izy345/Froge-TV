import { View, Text, Pressable, StyleSheet } from "react-native"
import Colors from "../../constants"
import Icon from "../CustomIcons"
import { useSelector, useDispatch } from "react-redux"
import IconButton from "../CustomIcons/IconButton";
import { configSliceActions } from "../../store/Configuration/config-slice";
import { useNavigation } from '@react-navigation/native';

function SearchHistoryCard({text="Search History"}) {

    const dispatch = useDispatch();
    const navigation = useNavigation();

    const onPressRemove = () => {
        dispatch(configSliceActions.removeExploreHistory(text));
    }

    const onPress = () => {
        navigation.navigate("SearchResults", {
            search: text,
        });
    }

    return (
    <View style={styles.container}>
        <Pressable
            onPress={onPress}
            android_ripple={{ color: Colors.twitchBlack700, borderless: true }}
            style={({ pressed }) => [
                pressed ? styles.onPress : null,
                styles.Pressable,
            ]}
        >
        <Text style={styles.text}>
            {text}
        </Text>
        </Pressable>

        <IconButton
            onPress={() => onPressRemove()}
            icon="close-outline"
            size={15}
            color={Colors.twitchWhite1000}
        />
    </View>
    )
}

export default SearchHistoryCard

const styles = StyleSheet.create({
    container:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.twitchBlack950,
        borderRadius: 4,
        padding: 4,
        height: 35,
        zIndex: 100,
        margin: 5,
        paddingLeft: 8,
        marginBottom: 10,
    },
    text:{
        color: Colors.twitchPurple900,
        fontSize: 13,
    },
    Pressable:{
        width: "90%",
    },
    onPress:{
        opacity: 0.75,
    }
})