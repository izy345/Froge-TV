import { View, Text, StyleSheet, Pressable } from "react-native"
import { Image } from "expo-image"
import Colors from "../../constants"
import Icon from "../CustomIcons"
import { useEffect, useState, useCallback, useMemo, useLayoutEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import searchActions from "../../store/SearchSlice/search-thunk"
import { useNavigation } from '@react-navigation/native';
import { cacheSliceActions, getCategoryViewerCount } from "../../store/cache/cache-slice"


function CategoryCard({id, name, imageUrl}) {

    const dispatch = useDispatch();
    const navigation = useNavigation();

    const viewerCache =  useSelector(getCategoryViewerCount(id))

    const handlePress = () => {
        navigation.navigate("StreamsFromCategory", {
            id: id,
            name: name,
        });
    }

    const [viewers, setViewers] = useState(0);

    const formatViewers = useCallback((num) => {
        if (num < 1000) return num.toString();
        return (num / 1000).toFixed(1) + "k";
    }, []);

    useEffect( () => {
        const estimateViewers = async () => {  
            if (viewerCache) {
                setViewers(viewerCache);
                return;
            }
            const resposne = await dispatch(searchActions.getEstiamtedViewersInCategory(id))
            setViewers(resposne);
            dispatch(cacheSliceActions.addCategoryCache({
                categoryId: id,
                viewerCount: resposne,
            }))
        }
        estimateViewers();
        
    },[id])

    const formattedViewers = useMemo(() => {
        return viewers != null ? formatViewers(viewers) : "Throttled";
    }, [viewers, formatViewers]);

    const truncatedName = useMemo(() => {
        return name.length > 30 ? name.substring(0, 27) + "..." : name;
    }, [name]);

    return (
    <Pressable
        onPress={handlePress}
        //android_ripple={{ color: Colors.twitchBlack700, borderless: true }}
        style={({ pressed }) => [
            styles.container,
            pressed ? styles.onPress : null,
        ]}
    
    >
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
            />
        </View>
        <View>
            <Text style={styles.text}>{truncatedName}</Text>
        </View>
        <View style={styles.viewersContainer}>
            <Icon icon='people' size={18} color={Colors.twitchBlack700} />
            <Text style={styles.viewerText}> Top: {formattedViewers}</Text>
        </View>
    </Pressable>
    )
}

export default CategoryCard

const styles = StyleSheet.create({
    container:{
        width: 110,
        height: 235,
        maxHeight: 235,
        margin: 5,
    },
    imageContainer:{
        marginBottom: 5,
    },
    image:{
        width: 110,
        height: 160,
        borderRadius: 5,
    },
    viewersContainer:{
        flexDirection: "row",
        marginBottom: 2,
    },
    text:{
        color: Colors.twitchWhite1000,
        fontWeight: "bold",
    },
    viewerText:{
        color: Colors.twitchWhite1000,
        fontSize: 12,
    },
    onPress:{
        opacity: 0.75,
    },
})