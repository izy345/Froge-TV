import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";
import { useDispatch, useSelector } from "react-redux";
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";
import { useFrameTick } from "../../utils/FrameTickProvider";

const animationStartTime = Date.now();

export default function EmoteSync({ emoteId, source, style }) {
    const dispatch = useDispatch();
    const width = style?.width ?? 32;
    const height = style?.height ?? 32;

    const tick = useFrameTick(); // 👈 This replaces the tick prop
    const memoizedSource = useMemo(() => source, [source]);
    const animatedImage = useAnimatedImage(memoizedSource);
    const cachedEmote = useSelector(getEmoteData(emoteId));

    // Cache emote frames
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

    // Pure frame calculation
    const currentFrameImage = useMemo(() => {
        if (!cachedEmote?.frames?.length || !cachedEmote.frameDurations)
            return null;
        if (cachedEmote.frameCount <= 1) return cachedEmote.frames[0];

        const elapsed = tick - animationStartTime;
        let time = elapsed % cachedEmote.totalDuration;

        for (let i = 0; i < cachedEmote.frameDurations.length; i++) {
            if (time < cachedEmote.frameDurations[i])
                return cachedEmote.frames[i];
            time -= cachedEmote.frameDurations[i];
        }

        return cachedEmote.frames[0];
    }, [tick, cachedEmote]);

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
