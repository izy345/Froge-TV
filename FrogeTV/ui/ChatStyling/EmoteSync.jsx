import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";
import { useDispatch, useSelector } from "react-redux";
import { useSharedValue } from "react-native-reanimated";
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

  const currentFrame = useSharedValue(null);
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
    console.log('[EmoteSync] ',currentFrame)
    if (!cachedEmote?.frames?.length || !cachedEmote.frameDurations) return;
    console.log('[EmoteSync] cachedEmote: ', cachedEmote)
    if (cachedEmote.frameCount <= 1) {
      currentFrame.value = cachedEmote.frames[0];
      return;
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
        if (frame) currentFrame.value = frame;
      }

      requestAnimationFrame(updateFrame);
    };

    updateFrame();

    return () => {
      mounted = false;
    };
  }, [cachedEmote]);

  if (!currentFrame) {
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
