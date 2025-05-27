import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";
import { useDispatch, useSelector } from "react-redux";
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";

const animationStartTime = Date.now();

// attempt to sync animated emotes with the Skia library
export default function EmoteSync({ emoteId, source, style }) {
    const dispatch = useDispatch();

    const flattenedStyle = StyleSheet.flatten(style) || {};
    const width = flattenedStyle.width ?? 32;
    const height = flattenedStyle.height ?? 32;

    const animatedImage = useAnimatedImage(source);
    const cachedEmote = useSelector(getEmoteData(emoteId));

    const [currentFrameImage, setCurrentFrameImage] = useState(null);

    // Step 1: Decode once and cache frame metadata if not already cached
    useEffect(() => {
        if (!animatedImage || cachedEmote) return;

        const frameCount = animatedImage.getFrameCount();
        const durations = [];
        const frameImages = [];

        for (let i = 0; i < frameCount; i++) {
            animatedImage.decodeNextFrame();
            durations.push(animatedImage.currentFrameDuration());
            frameImages.push(animatedImage.getCurrentFrame());
        }

        const totalDuration = durations.reduce((a, b) => a + b, 0);

        dispatch(
            cacheSliceActions.addEmoteCache({
                emoteId,
                emoteUrl: source,
                frameDurations: durations,
                totalDuration,
                frameCount,
                frames: frameImages,
            })
        );
    }, [animatedImage, cachedEmote]);

    // Step 2: Animation ticker
    useEffect(() => {
        if (!cachedEmote?.frames?.length || !cachedEmote.frameDurations) return;

        let isMounted = true;

        const getCurrentFrameIndex = () => {
            const elapsed = Date.now() - animationStartTime;
            let time = elapsed % cachedEmote.totalDuration;

            for (let i = 0; i < cachedEmote.frameDurations.length; i++) {
                if (time < cachedEmote.frameDurations[i]) return i;
                time -= cachedEmote.frameDurations[i];
            }

            return 0;
        };

        const updateFrame = () => {
            if (!isMounted) return;

            const index = getCurrentFrameIndex();
            const frame = cachedEmote.frames[index];
            setCurrentFrameImage(frame);

            requestAnimationFrame(updateFrame);
        };

        updateFrame();

        return () => {
            isMounted = false;
        };
    }, [cachedEmote]);

    // Placeholder
    if (!currentFrameImage) {
        return <View style={[styles.placeholder, { width, height }]} />;
    }

    return (
        <Canvas style={[{ width, height }, style]}>
            <Image
                image={currentFrameImage}
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
        backgroundColor: "#222",
    },
});
