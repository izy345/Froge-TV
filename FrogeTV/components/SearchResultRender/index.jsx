import { View, Text, useWindowDimensions, FlatList, StyleSheet, ScrollView } from "react-native"
import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsFocused } from "@react-navigation/native";
import searchActions from "../../store/SearchSlice/search-thunk";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CategoryCard from "../../ui/CategoryCard";
import SearchStreamCard from "../../ui/StreamCard/SearchStreamCard";
import Colors from "../../constants";
import { searchSliceActions } from "../../store/SearchSlice/search-slice";

function SearchResultRender({searchQuery}) {

    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    // width detection 
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait);

    // Data
    const searchResultStreams = useSelector((state) => state.search.searchResultStreams);
    const searchResultCategories = useSelector((state) => state.search.searchResultCategories);
    
        // in some devices, specifically ipadOS, the hook useWindowDimensions
        // does not update when the device is rotated, so we need to use
        // the following code to get the screen width. Just inverted :)
        const screenWidth = useMemo(() => {
            const adjustedWidth = windowWidth - insets.left - insets.right;
            if (windowWidth < windowHeight && !phoneIsPotrait) {
                return adjustedWidth;
            } else if (windowWidth > windowHeight && phoneIsPotrait) {
                return windowHeight - insets.left - insets.right;
            }
            return adjustedWidth;
        }, [windowWidth, windowHeight, phoneIsPotrait, insets]);

    useEffect( () => {
        const fetchSearchResults = async () => {
            await dispatch(searchActions.getSearchQuery(searchQuery));
        }
        if (isFocused){
        fetchSearchResults();
        } else {
            dispatch(searchSliceActions.setSearchResultStreams([]));
            dispatch(searchSliceActions.setSearchResultCategories([]));
        }
        return () => {
            dispatch(searchSliceActions.setSearchResultStreams([]));
            dispatch(searchSliceActions.setSearchResultCategories([]));
        }
        
    },[isFocused])

    

    return (
    <ScrollView>
        <View style={[styles.categoryContainer,{ width: screenWidth }]}>
            <Text style={styles.boldText}>Categories</Text>
            {searchResultCategories.length > 0 ? (
                <FlatList
                    data={searchResultCategories}
                    renderItem={({ item }) => (
                        <CategoryCard
                        id={item.id}
                        name={item.name}
                        imageUrl={
                            item.box_art_url.replace(/-\d+x\d+(\.jpg)/, "-210x280$1")
                        }
                    />
                    )}
                    keyExtractor={(item) => String(item.id)}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            ) : (
                <View>
                    <Text style={styles.text}>No Categories Found</Text>
                </View>
            )}
            <Text style={styles.boldText}>Channels</Text>
            <View style={styles.channelContainer}>
                {searchResultStreams.length > 0 ? (
                        searchResultStreams.map((item) => (
                                
                                <SearchStreamCard
                                    key={item.id}
                                    id={item.id}
                                    user_login={item.broadcaster_login}
                                    user_name={item.display_name}
                                    game_name={item.game_name}
                                    is_live={item.is_live}
                                    started_at={item.started_at}
                                    thumbnail_url={item.thumbnail_url}
                                    title={item.title}
                                    // leave offline card props to you...
                                />
                            )
                    )) :
                    (
                        <View>
                            <Text style={styles.text}>No Streams Found</Text>
                        </View>
                    )}
            </View>
        </View>
        
    </ScrollView>
    )
}

export default SearchResultRender

const styles = StyleSheet.create({
    categoryContainer:{
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    channelContainer:{
        flexDirection: "row",
        justifyContent: "flex-start",
        flexWrap: 'wrap'
    },
    boldText:{
        color: Colors.twitchWhite1000,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,
    },
    text:{
        color: Colors.twitchWhite1000,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,
    }
})