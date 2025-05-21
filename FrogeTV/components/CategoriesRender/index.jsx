import React, {
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
} from "react";
import { FlatList, useWindowDimensions, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import searchActions from "../../store/SearchSlice/search-thunk";
import CategoryCard from "../../ui/CategoryCard";
import Colors from "../../constants";
import DynamicFlatList from "../DynamicFlatList";

function CategoriesRender() {
    const dispatch = useDispatch();

    const [cursor, setCursor] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const onEndReachedCalledDuringMomentum = useRef(false);

    const gameCategoryList = useSelector(
        (state) => state.search.gameCategoryList
    );
    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait);

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const { screenWidth, numColumns } = useMemo(() => {
        const adjustedWidth = windowWidth - insets.left - insets.right;
        const adjustedHeight = windowHeight - insets.left - insets.right;
        let computedWidth;
        if (windowWidth < windowHeight && !phoneIsPotrait) {
            computedWidth = adjustedHeight;
        } else if (windowWidth > windowHeight && phoneIsPotrait) {
            computedWidth = windowHeight - insets.left - insets.right;
        } else {
            computedWidth = adjustedWidth;
        }
        return {
            screenWidth: computedWidth,
            numColumns: Math.floor(computedWidth / 120),
        };
    }, [windowWidth, windowHeight, phoneIsPotrait, insets]);

    // On first render, store the initial numColumns.
    const prevNumColumnsRef = useRef(null);
    useEffect(() => {
        if (prevNumColumnsRef.current === null) {
            prevNumColumnsRef.current = numColumns;
        }
    }, [numColumns]);

    const fetchCategories = useCallback(async () => {
        if (isFetching) return;
        setIsFetching(true);
        try {
            const newCursor = await dispatch(
                searchActions.getTopGameCategories(cursor)
            );
            if (newCursor) {
                setCursor(newCursor);
            }
        } finally {
            setIsFetching(false);
        }
    }, [cursor, dispatch, isFetching]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const newCursor = await dispatch(
            searchActions.getTopGameCategories(null)
        );
        setCursor(newCursor || null);
        setRefreshing(false);
    }, [dispatch]);

    return (
        <DynamicFlatList
            // dynamic props
            numColumns={numColumns}
            itemHeight={245}
            // flatlist props
            data={gameCategoryList}
            reMount={`${phoneIsPotrait}-${screenWidth}`}
            renderItem={({ item }) => (
                <CategoryCard
                    id={item.id}
                    name={item.name}
                    imageUrl={item.box_art_url.replace(
                        /{width}x{height}/,
                        "210x280"
                    )}
                />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
                padding: 10,
                marginLeft: "auto",
                marginRight: "auto",
            }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.twitchPurple900}
                    colors={[Colors.twitchPurple1000, Colors.twitchWhite1000]}
                />
            }
            onEndReachedThreshold={(Platform.OS === "ios" && Platform.isPad)  ? .5 : 1.55}
            onMomentumScrollBegin={() => {
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

export default CategoriesRender;
