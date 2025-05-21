import { View, TextInput, Text, StyleSheet, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native"
import Colors from "../../constants"
import Icon from "../CustomIcons"
import SearchHistoryCard from "../SearchHistoryCard"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { configSliceActions } from "../../store/Configuration/config-slice"
import IconButton from "../CustomIcons/IconButton"
import { useNavigation } from "@react-navigation/native"
import useKeyboardFocus from "../../utils/useKeyboardFocus"

function SearchInput() {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    
    const ExploreHistory = useSelector( (state) => state.config.ExploreHistory);

    const [text, setText] = useState("");

    const { isFocused, setIsFocused } = useKeyboardFocus();

    const onSubmitSearch = () => {
        if (text.length === 0) return;
        // Check if the search text already exists
        if (!ExploreHistory.includes(text)) dispatch(configSliceActions.appendExploreHistory(text));
        // Navigate to the search results screen
        setIsFocused(false);
        Keyboard.dismiss();
        setText("");
        navigation.navigate("SearchResults", {
            search: text,
        });
    }


    return (
    <View>
        <View style={styles.inputContainer}>
            <Icon
                icon="search"
                size={20}
                color={Colors.twitchBlack950}
                style={{ position: "absolute", top: 10, left: 10 }}
            />
            <TextInput
                placeholder="Search"
                placeholderTextColor={Colors.twitchBlack950}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={(text) => setText(text)}
                value={text}
                onSubmitEditing={onSubmitSearch}
                autoCapitalize="none"
                autoCorrect={false}
                caretHidden={!isFocused} 
                style={styles.input}
            />
            <IconButton
                icon="chevron-down-outline"
                size={16}
                color={Colors.twitchWhite1000}
                onPress={() => {
                    setText("");
                    setIsFocused(false);
                    Keyboard.dismiss();
                }}
            />
        </View>
        { isFocused && ExploreHistory && ExploreHistory.length > 0 &&
        <ScrollView
            style={styles.historyContainer}
            keyboardShouldPersistTaps="always"
        >
            {ExploreHistory.map( (item, index) => (
                <SearchHistoryCard
                    key={index}
                    text={item}
                />
            )
        )}
        </ScrollView>
        }
    </View>
    )
}

export default SearchInput

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.twitchBlack900,
        borderRadius: 4,
        padding: 4,
        height: 35,
        zIndex: 100,
        margin: 10,
    },
    historyContainer: {
        position: "absolute",
        height: 150,
        top: 55,
        left: 10,
        right: 10,
        backgroundColor: Colors.twitchBlack1000,
        zIndex: 200,
        borderRadius: 4,
        padding: 10,
        
    },
    input: {
        flex: 1,
        borderRadius: 8,
        padding: 8,
        color: Colors.twitchWhite1000,
        height: 30,
    },
})