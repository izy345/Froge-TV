import { View, Text, StyleSheet, TFlat } from "react-native"
import Colors from "../../constants"
import Icon from "../../ui/CustomIcons"
import SearchInput from "../../ui/SearchInput"
import ClickableText from "../../ui/ClickableText"
import { useSelector, useDispatch } from "react-redux"
import { searchSliceActions } from "../../store/SearchSlice/search-slice"
import CategoriesRender from "../CategoriesRender"
import LiveChannelRender from "../LiveChannelRender"

function RenderSearch() {

    const dispatch = useDispatch();

    const renderCategory = useSelector( (state) => state.search.renderCategory);
        const setCategory = (x) => { dispatch(searchSliceActions.setRenderCategory(x)) }

    return (
        <>
            <SearchInput />
            <View style={styles.topHeaderContainer}>
                <ClickableText text={'Categories'} isPressed={renderCategory} onPress={() => setCategory(true)} />
                <ClickableText text={'Live Channels'} isPressed={!renderCategory} onPress={() => setCategory(false)} />
            </View>
            <View style={{flex: 1}}>
                {renderCategory === true ? 
                    <CategoriesRender />
                    :
                    <LiveChannelRender />
                }
            </View>
        </>
    )
}

export default RenderSearch

const styles = StyleSheet.create({
    topHeaderContainer:{
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        padding: 10,
        backgroundColor: Colors.oledBlack,
        borderBottomWidth :2,
        borderBottomColor: Colors.twitchBlack950,
    },
})