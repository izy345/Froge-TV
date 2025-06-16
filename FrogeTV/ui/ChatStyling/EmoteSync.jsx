import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";
import { useDispatch, useSelector } from "react-redux";
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";

const animationStartTime = Date.now();

// EXPERIMENTAL: frame accurate but resource heavy 
export default function EmoteSync({ emoteId, source, style }) {
    const dispatch = useDispatch();

    const flattenedStyle = StyleSheet.flatten(style) || {};
    const width = flattenedStyle.width ?? 32;
    const height = flattenedStyle.height ?? 32;

    const memoizedSource = useMemo(() => source, [source]);
    const animatedImage = useAnimatedImage(memoizedSource);

    const cachedEmote = useSelector(getEmoteData(emoteId));

    const [currentFrameImage, setCurrentFrameImage] = useState(null);
    const currentFrameIndexRef = useRef(-1);

    // Decode and cache emote frames on first load
    useEffect(() => {
        if (!animatedImage || cachedEmote) return;

        const frameCount = animatedImage.getFrameCount();
        const frameDurations = [];
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            animatedImage.decodeNextFrame();
            frameDurations.push(animatedImage.currentFrameDuration());
            frames.push(animatedImage.getCurrentFrame());
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
            })
        );
    }, [animatedImage, cachedEmote]);

    // Sync animation to global time using Date.now()
    useEffect(() => {
        if (!cachedEmote?.frames?.length || !cachedEmote.frameDurations) return;

        // guard against static emotes
        if (cachedEmote.frameCount <= 1) {
            // Static image - just set frame once and no animation loop needed
            setCurrentFrameImage(cachedEmote.frames[0]);
            return; // skip animation loop
        }

        let mounted = true;

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
            if (!mounted) return;

            const index = getCurrentFrameIndex();

            if (index !== currentFrameIndexRef.current) {
                currentFrameIndexRef.current = index;
                const frame = cachedEmote.frames[index];
                if (frame) setCurrentFrameImage(frame);
            }

            requestAnimationFrame(updateFrame);
        };

        updateFrame();

        return () => {
            mounted = false;
        };
    }, [cachedEmote]);

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
        backgroundColor: "#1a1a1a",
    },
});