import { View, StyleSheet} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import homeActions from "../../store/homeSlice/home-thunks"
import { useIsFocused } from "@react-navigation/native"
import RenderStreamFollowList from "../../components/RenderStreamFollowList"

// route component
function Home() {

    const isFocused = useIsFocused();
    const dispatch = useDispatch()

    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait)
    const streamFollowList = useSelector((state) => state.home.streamFollowList)
    

    useEffect(() => {
        const getStreams = async () => {
            if (isFocused){
                dispatch(homeActions.getStreamFromFollows())
            }
        }
        getStreams()
    },[isFocused, dispatch])


    return (
        <View style={styles.coontainer}>
            <RenderStreamFollowList
                data={streamFollowList}
            />
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    coontainer: {
        flex: 1,

    },
})
