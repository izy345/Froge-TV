import { FlatList } from "react-native"
import StreamCard from "../../ui/StreamCard";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";
import { useMemo } from "react";
import DynamicFlatList from "../DynamicFlatList";

function RenderStreamFollowList({data}) {

    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait);

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // in some devices, specifically ipadOS, the hook useWindowDimensions
    // does not update when the device is rotated, so we need to use
    // the following code to get the screen width. Just inverted :)
    const screenWidth = useMemo(() => {
        const adjustedWidth = windowWidth - insets.left - insets.right;
        const adjustedHeight = windowHeight - insets.left - insets.right;
        if (windowWidth < windowHeight && !phoneIsPotrait) {
            return adjustedHeight;
        } else if (windowWidth > windowHeight && phoneIsPotrait) {
            return windowHeight - insets.left - insets.right;
        }
        return adjustedWidth;
    }, [windowWidth, windowHeight, phoneIsPotrait, insets]);

    const numColumns = useMemo(() => {
            const containerWidth = screenWidth * 0.96;
            const itemMaxWidth = phoneIsPotrait ? 690 : 390;
            const effectiveItemWidth = Math.min(containerWidth, itemMaxWidth);
            return Math.floor(screenWidth / effectiveItemWidth) || 1;
        }, [screenWidth, phoneIsPotrait]);

    return (
        <DynamicFlatList
            data={data}
            itemHeight={160}
            numColumns={numColumns}
            reMount={`${phoneIsPotrait}-${screenWidth}`}
            contentContainerStyle={{ padding: 0, marginLeft: 'auto', marginRight: 'auto', width: screenWidth}}
            renderItem={({ item }) => (
                <StreamCard
                    forcePotraitMode={numColumns === 1}
                    title={item.title}
                    user_id={item.user_id}
                    user_login={item.user_login}
                    game_name={item.game_name}
                    viewer_count={item.viewer_count}
                    is_mature={item.is_mature}
                    started_at={item.started_at}
                    thumbnail_url={item.thumbnail_url}
                    tags={item.tags}
                    user_name={item.user_name}
                    id={item.id}
                />
                )}
            keyExtractor={(item) => item.id}
        />
    )
}

export default RenderStreamFollowList
