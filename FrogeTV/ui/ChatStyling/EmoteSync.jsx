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
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";
import { maybeEncodeAndAppendAnimationCache } from "../../store/cache/cache-slice";

const animationStartTime = Date.now();

export default function EmoteSync({ emoteId, source, style }) {
    const dispatch = useDispatch();

    const width = style.width ?? 32;
    const height = style.height ?? 32;

    const memoizedSource = useMemo(() => source, [source]);
    const animatedImage = useAnimatedImage(memoizedSource);
    const staticImage = useImage(memoizedSource)

    const cachedEmote = useSelector(getEmoteData(emoteId));
    const maxEmoteCacheSize = useSelector((state) => state.config.maxEmoteCacheSize)
    const forgiveCacheIndex = useSelector((state) => state.config.forgiveCacheIndex) 
    const animationCache = useSelector((state) => state.cache.animationCache);

    const [gifUri, setGifUri] = useState(null);
    const skiaImage = useAnimatedImageValue(
        gifUri
    );;

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
    }, [cachedEmote]);

    /*if (!skiaImage || !gifUri) {
        return <View style={[styles.placeholder, { width, height }]} />;
    }*/

    if (!skiaImage || !gifUri) {
    return(
        <Canvas style={[{ width, height }, style]}>
            <Image
                image={staticImage}
                x={0}
                y={0}
                width={width}
                height={height}
                fit="contain"
                opacity={0.5}
            />
        </Canvas>)
}

    if (Platform.OS === 'ios'){
        return (
            <Canvas style={[{ width, height }, style]}>
                <Image
                    image={skiaImage}
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fit="contain"
                />
            </Canvas>
        );
    } else{
        return (
            <RNImage
                source={{ uri: gifUri }}
                style={[{ width, height }, style]}
                resizeMode="contain"
            />
        );
    }
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: "#515151",
    },
});
