import { useLayoutEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../../constants";
import Icon from "../../ui/CustomIcons";
import RenderStreamsCat from "../../components/RenderStreamsCat";
import { useIsFocused } from "@react-navigation/native";

function StreamsFromCategory({ route, navigation }) {
    const { id, name } = route.params;

    const isFocused = useIsFocused();

    useLayoutEffect(() => {
        if (!isFocused) return;

        const parent = navigation.getParent('home');
        console.log("[parent]", 'trigger');
        // Set the header for this screen
        parent?.setOptions({
            headerTitle: name,
            headerLeft: () => (
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon
                        icon="arrow-back-outline"
                        size={24}
                        color={Colors.twitchWhite1000}
                    />
                </Pressable>
            ),
        });
    }, [name, isFocused]);
    
    return (
        <View style={styles.container}>
            <RenderStreamsCat
                id={id}
            />
        </View>
    );
}

export default StreamsFromCategory;

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    backButton: {
        
        marginLeft: 7,
        marginRight: 7, 
    },
});