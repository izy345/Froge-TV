import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
    Canvas,
    Image,
    useAnimatedImage,
    useImage,
    useAnimatedImageValue,
} from "@shopify/react-native-skia";
import { useDispatch, useSelector } from "react-redux";
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";
import EmoteGifEncoderModule from "../../modules/emote-gif-encoder/src/EmoteGifEncoderModule";

const animationStartTime = Date.now();

export default function EmoteSync({ emoteId, source, style }) {
    const dispatch = useDispatch();

    const width = style.width ?? 32;
    const height = style.height ?? 32;

    const memoizedSource = useMemo(() => source, [source]);
    const animatedImage = useAnimatedImage(memoizedSource);

    const cachedEmote = useSelector(getEmoteData(emoteId));

    const [gifUri, setGifUri] = useState(null);
    const skiaImage = useAnimatedImageValue(
        gifUri
    );


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
        if (!cachedEmote?.base64Frames?.length || !cachedEmote.frameDurations){
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
        
        EmoteGifEncoderModule.encodeGif(reorderedFrames, reorderedDurations)
            .then((path) => {
                //console.log('cachedEmote', cachedEmote);
                setGifUri(`data:image/gif;base64,${path}`);
            })
            .catch(console.warn);
    }, [cachedEmote]);

    if (!skiaImage) {
        return <View style={[styles.placeholder, { width, height }]} />;
    }

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
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: "#1a1a1a",
    },
});
