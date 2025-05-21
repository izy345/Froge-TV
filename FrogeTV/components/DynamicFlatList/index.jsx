import React, { useEffect, useRef } from "react";
import { FlatList } from "react-native";

export default function DynamicFlatList({
    reMount,
    numColumns,
    itemHeight,
    data,
    onScroll,
    ...rest
  }){

    // Error handling for itemHeight and numColumns
    const errorItemHeightLogged = useRef(false);
    useEffect(() => {
        if (
            (itemHeight === undefined || itemHeight === null) &&
            !errorItemHeightLogged.current
        ) {
            console.error(
                "DynamicFlatList: `itemHeight` prop is required. Items must have a fixed height or the list will not scroll correctly."
            );
            errorItemHeightLogged.current = true;
        }
    }, [itemHeight]);

    const errorNumColumnsLogged = useRef(false);
    useEffect(() => {
        if (
            (numColumns === undefined || numColumns === null) &&
            !errorNumColumnsLogged.current
        ) {
            console.error(
                "DynamicFlatList: `numColumns` prop is required. It defines the grid layout and is needed for scroll restoration logic."
            );
            errorNumColumnsLogged.current = true;
        }
    }, [numColumns]);

    const scrollOffsetRef = useRef(0);

    const flatListRef = useRef(null);

    // Store the previous number of columns to detect orientation changes.
    const prevNumColumnsRef = useRef(null);

    // On first render, initialize prevNumColumnsRef.
    useEffect(() => {
        if (prevNumColumnsRef.current === null) {
            prevNumColumnsRef.current = numColumns;
            //console.log("Initial numColumns stored:", numColumns);
        }
    }, [numColumns]);

    // Trigger scroll restoration only when numColumns (or orientation) changes.
    useEffect(() => {
        if (
            flatListRef.current &&
            scrollOffsetRef.current > 5 &&
            prevNumColumnsRef.current !== null //&&
            //prevNumColumnsRef.current !== numColumns
        ) {
            const offset = scrollOffsetRef.current;
            const oldColumns = prevNumColumnsRef.current;
            const newColumns = numColumns;
            const oldRowFraction = offset / itemHeight;
            const oldItemIndex = oldRowFraction * oldColumns;
            const newRow = Math.round(oldItemIndex / newColumns);
            let newOffset = newRow * itemHeight;
            // Clamp newOffset to the maximum possible offset.
            const totalRows = Math.ceil(data.length / newColumns);
            const maxOffset = Math.max((totalRows - 1) * itemHeight, 0);
            newOffset = Math.min(newOffset, maxOffset);
            /*
            console.log(
                "Restoration conditions met. Offset:",
                offset,
                "OldColumns:",
                oldColumns,
                "NewColumns:",
                newColumns,
                "OldRowFraction:",
                oldRowFraction,
                "OldItemIndex:",
                oldItemIndex,
                "NewRow:",
                newRow,
                "NewOffset:",
                newOffset
            );*/
            requestAnimationFrame(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToOffset({
                        offset: newOffset,
                        animated: false,
                    });
                    prevNumColumnsRef.current = numColumns;
                }
            });
        }
    }, [itemHeight, reMount]);

    return (
        <FlatList
            key={reMount}
            ref={flatListRef}
            numColumns={numColumns}
            data={data}
            onScroll={(event) => {
                
                scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
                if (onScroll) {
                    onScroll(event);
                }
            }}
            getItemLayout={(data, index) => ({
                length: itemHeight,
                offset: itemHeight * index,
                index,
            })}
            {...rest}
            scrollEventThrottle={16}
        />
    );
};

