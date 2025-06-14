import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, Alert, Image as RNImage, Platform  } from "react-native";
import {
    Canvas,
    Image,
    useAnimatedImage,
    useImage,
    useAnimatedImageValue,
} from "@shopify/react-native-skia";
import { useDispatch, useSelector } from "react-redux";
import { Image as ExImage } from "expo-image";
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";
import { maybeEncodeAndAppendAnimationCache } from "../../store/cache/cache-slice";
import { updateAnimatedEmoteRange, pruneOldEntriesIfNeeded, fetchBase64Data } from "../../database";

const animationStartTime = Date.now();

export default function EmoteSync({ emoteId, source, style }) {
    const dispatch = useDispatch();

    const width = style.width ?? 32;
    const height = style.height ?? 32;

    const memoizedSource = useMemo(() => source, [source]);
    const animatedImage = useAnimatedImage(memoizedSource);
    //const staticImage = useImage(memoizedSource)

    const cachedEmote = useSelector(getEmoteData(emoteId));
    const maxEmoteCacheSize = useSelector((state) => state.config.maxEmoteCacheSize)
    const forgiveCacheIndex = useSelector((state) => state.config.forgiveCacheIndex) 
    const EmoteSyncUseDatabase = useSelector((state) => state.config.EmoteSyncUseDatabase);

    const animationCache = useSelector((state) => state.cache.animationCache);

    const [gifUri, setGifUri] = useState(null);

    useEffect(() => {
        if (!animatedImage || cachedEmote) return;
        const frameCount = animatedImage.getFrameCount();
        const frameDurations = [];
        const frames = [];
        const base64Frames = [];
        for (let i = 0; i < frameCount; i++) {
            animatedImage.decodeNextFrame();
            frameDurations.push(animatedImage.currentFrameDuration());
            const frame = animatedImage.getCurrentFrame();
            frames.push(frame);
            const base64 = frame.encodeToBase64();
            base64Frames.push(base64);
        }
        
        const totalDuration = frameDurations.reduce((a, b) => a + b, 0);
        dispatch(
            cacheSliceActions.addEmoteCache({
                emoteId,
                emoteUrl: source,
                frameDurations,
                totalDuration,
                frameCount,
                frames,
                base64Frames,
            })
        );
    }, [animatedImage, cachedEmote]);

    useEffect(() => {
        if (!cachedEmote?.base64Frames?.length || !cachedEmote.frameDurations || gifUri !== null){
            return;
        }
        //console.log("Encoding GIF for emote:", emoteId);
        if (cachedEmote.frameCount <= 1) return;

        const elapsed = Date.now() - animationStartTime;
        let time = elapsed % cachedEmote.totalDuration;

        let startIndex = 0;
        for (let i = 0; i < cachedEmote.frameDurations.length; i++) {
            if (time < cachedEmote.frameDurations[i]) {
                startIndex = i;
                break;
            }
            time -= cachedEmote.frameDurations[i];
        }

        const rotateArray = (arr, index) =>
            arr.slice(index).concat(arr.slice(0, index));

        const reorderedFrames = rotateArray(
            cachedEmote.base64Frames,
            startIndex
        );
        const reorderedDurations = rotateArray(
            cachedEmote.frameDurations,
            startIndex
        );
        if (!EmoteSyncUseDatabase){
            dispatch(maybeEncodeAndAppendAnimationCache({
                animationCache,
                emoteUrl: source,
                timeIndex: startIndex,
                base64Frames: reorderedFrames,
                frameDurations: reorderedDurations,
                totalNumberOfFrames: cachedEmote.frameCount,
                maxCacheSize: maxEmoteCacheSize,
                forgive: forgiveCacheIndex,
            })).then(({ base64 }) => {
                    setGifUri(base64);
                })
                .catch(console.warn);
        } else{
            updateAnimatedEmoteRange(
                {
                emoteUrl: source,
                timeIndex: startIndex,
                totalNumberOfFrames: cachedEmote.frameCount,
                },
                forgiveCacheIndex,
                reorderedFrames,
                reorderedDurations
            ).then((emote) => {
                // console.log("Emote updated in database:", emote);
                if(emote){
                    setGifUri(emote.base64Frames);
                }
            }).then( () => {
                pruneOldEntriesIfNeeded(maxEmoteCacheSize);
            })
            .catch(
                // fallback to just fetching from database
                fetchBase64Data(source, startIndex)
                    .then((emote) => {
                        if (emote) {
                            setGifUri(emote.base64Frames);
                        } else {
                            //console.warn("Emote not found in database:", source, startIndex);
                        }
                    })
                    .catch((error) => {
                        //console.warn("Error fetching emote from database:", error);
                    })
            );
        }
    }, [cachedEmote]);

    /*if (!skiaImage || !gifUri) {
        return <View style={[styles.placeholder, { width, height }]} />;
    }*/

    return(
        <>
        {!gifUri ?
            <ExImage
                source={{uri: source}}
                style={[{ width, height, opacity: .25 }, style]}
                cachePolicy="memory"
            />
            :
            <RNImage
                source={{ uri: gifUri }}
                style={[{ width, height, opacity: gifUri === null ? .25 : 1 }, style]}
                resizeMode="contain"
            />
        }
        </>
        );
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: "#515151",
    },
});
