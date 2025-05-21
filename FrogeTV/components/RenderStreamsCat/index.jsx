import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FlatList, useWindowDimensions, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import searchActions from "../../store/SearchSlice/search-thunk";
import StreamCard from "../../ui/StreamCard";
import Colors from "../../constants";
import { useIsFocused } from "@react-navigation/native"
import { searchSliceActions } from "../../store/SearchSlice/search-slice";
import DynamicFlatList from "../DynamicFlatList";

function RenderStreamsCat({id}) {

    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const [cursor, setCursor] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const onEndReachedCalledDuringMomentum = useRef(false);

    const streamCategoryList = useSelector((state) => state.search.streamCategoryList);
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
    // Combined fetch function with an isFetching lock.
    const fetchCategories = useCallback(async () => {
        if (isFetching) return;
        if(cursor === null) return;
        setIsFetching(true);
        try {
            const newCursor = await dispatch(searchActions.getStreamsfromCategories(cursor, id));
            if (newCursor) {
                setCursor(newCursor);
            }
        } finally {
            setIsFetching(false);
        }
    }, [cursor, dispatch, isFetching, id]);

    // Initial load.
    useEffect(() => {
        const fetchInitialCategories = async () => {
            //if (isFocused) {
                setIsFetching(true);
                try {
                    const newCursor = await dispatch(searchActions.getStreamsfromCategories(null, id));
                    if (newCursor) {
                        setCursor(newCursor);
                    }
                } finally {
                    setIsFetching(false);
                }
            /*}
            else{
                setCursor(null);

            }*/
        }
        fetchInitialCategories()
        return () => {
            dispatch(searchSliceActions.setStreamCategoryList([]));
        }

    }, [id, /*isFocused*/]);

    // When user pulls to refresh, reset the list.
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const newCursor = await dispatch(searchActions.getStreamsfromCategories(null, id));
        setCursor(newCursor || null);
        setRefreshing(false);
    }, [dispatch, id]);

    // dynamic number of columns based on screen width
    const numColumns = useMemo(() => {
        const containerWidth = screenWidth * 0.96;
        const itemMaxWidth = phoneIsPotrait ? 690 : 390;
        const effectiveItemWidth = Math.min(containerWidth, itemMaxWidth);
        return Math.floor(screenWidth / effectiveItemWidth) || 1;
    }, [screenWidth, phoneIsPotrait]);

    // When component mounts (or remounts due to key change) restore scroll position

    

    return (
        <DynamicFlatList
            itemHeight={160}
            reMount={`${phoneIsPotrait}-${screenWidth}`}
            horizontal={false}
            numColumns={numColumns}
            data={streamCategoryList}
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
            contentContainerStyle={{ padding: 0, marginLeft: 'auto', marginRight: 'auto', width: screenWidth}}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.twitchPurple900}
                    colors={[Colors.twitchPurple1000, Colors.twitchWhite1000]}
                />
            }
            onEndReachedThreshold={1.00}
            // useRefs to stop from firing twice on (known issue that can happen)
            onMomentumScrollBegin={() => {
                // reset the momentum flag when scrolling starts
                onEndReachedCalledDuringMomentum.current = false;
            }}
            onEndReached={() => {
                if (!onEndReachedCalledDuringMomentum.current) {
                    fetchCategories();
                    onEndReachedCalledDuringMomentum.current = true;
                }
            }}
        />
    );
}

export default RenderStreamsCat;