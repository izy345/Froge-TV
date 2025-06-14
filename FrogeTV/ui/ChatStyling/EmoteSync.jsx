import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Image,
  useAnimatedImage
} from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { getEmoteData, cacheSliceActions } from "../../store/cache/cache-slice";

const animationStartTime = Date.now();

export default function EmoteSync({ emoteId, source, style }) {
  const dispatch = useDispatch();
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const width = flattenedStyle.width ?? 32;
  const height = flattenedStyle.height ?? 32;

  const memoizedSource = useMemo(() => source, [source]);
  const animatedImage = useAnimatedImage(memoizedSource);
  const cachedEmote = useSelector(getEmoteData(emoteId));

  const currentFrameIndexRef = useRef(-1);
  const currentFrame = useSharedValue(null); // Skia tracks this internally

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

  // Sync animation
  useEffect(() => {
    if (!cachedEmote?.frames?.length || !cachedEmote.frameDurations) return;

    if (cachedEmote.frameCount <= 1) {
      currentFrame.value = cachedEmote.frames[0];
      return;
    }

    let mounted = true;

    const updateFrame = () => {
      if (!mounted) return;

      const elapsed = Date.now() - animationStartTime;
      let time = elapsed % cachedEmote.totalDuration;

      let index = 0;
      for (let i = 0; i < cachedEmote.frameDurations.length; i++) {
        if (time < cachedEmote.frameDurations[i]) {
          index = i;
          break;
        }
        time -= cachedEmote.frameDurations[i];
      }

      if (index !== currentFrameIndexRef.current) {
        currentFrameIndexRef.current = index;
        currentFrame.value = cachedEmote.frames[index];
      }

      requestAnimationFrame(updateFrame);
    };

    updateFrame();

    return () => {
      mounted = false;
    };
  }, [cachedEmote]);

  if (!currentFrame.value) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  return (
    <Canvas style={[{ width, height }, style]}>
      <Image
        image={currentFrame}
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
