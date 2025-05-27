import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";

const animationStartTime = Date.now();

export default function EmoteSync({ source, style }) {
  // useAnimatedImage must be called once per render here
  const animatedImage = useAnimatedImage(source);

  const frameDurationsRef = useRef([]);
  const totalDurationRef = useRef(0);
  const frameCountRef = useRef(0);

  const [frameImage, setFrameImage] = useState(null);

  const flattenedStyle = StyleSheet.flatten(style) || {};
  const width = flattenedStyle.width ?? 32;
  const height = flattenedStyle.height ?? 32;

  // On mount, initialize frame durations & counts once per component
  useEffect(() => {
    if (!animatedImage) return;

    const frameCount = animatedImage.getFrameCount();
    frameCountRef.current = frameCount;

    // decode all frames once to cache durations
    const durations = [];
    for (let i = 0; i < frameCount; i++) {
      animatedImage.decodeNextFrame();
      durations.push(animatedImage.currentFrameDuration());
    }
    frameDurationsRef.current = durations;
    totalDurationRef.current = durations.reduce((a, b) => a + b, 0);

    // Reset to frame 0 by recreating the image (or use a ref/shared instance)
  }, [animatedImage]);

  // Calculate which frame to show, update frameImage
  useEffect(() => {
    if (!animatedImage || frameDurationsRef.current.length === 0) return;

    let running = true;

    function getFrameIndex(elapsed) {
      let time = elapsed % totalDurationRef.current;
      for (let i = 0; i < frameCountRef.current; i++) {
        if (time < frameDurationsRef.current[i]) return i;
        time -= frameDurationsRef.current[i];
      }
      return 0;
    }

    // WARNING: We don't have a "seek" function, so we decode frames up to the desired frame
    // But decoding all frames every render is expensive.
    // Instead, decode only the difference since last frame.
    let lastFrame = 0;

    function update() {
      if (!running) return;

      const elapsed = Date.now() - animationStartTime;
      const targetFrame = getFrameIndex(elapsed);

      // decode next frames until we reach targetFrame
      let steps = targetFrame - lastFrame;
      if (steps < 0) {
        // animation looped, reset animation to first frame
        // We can't reset directly; workaround: recreate animatedImage or keep a ref
        // For now, let's decode all frames from start to targetFrame:
        for (let i = 0; i <= targetFrame; i++) {
          animatedImage.decodeNextFrame();
        }
      } else {
        for (let i = 0; i < steps; i++) {
          animatedImage.decodeNextFrame();
        }
      }
      lastFrame = targetFrame;

      const currentFrameImage = animatedImage.getCurrentFrame();
      setFrameImage(currentFrameImage);

      requestAnimationFrame(update);
    }

    update();

    return () => {
      running = false;
    };
  }, [animatedImage]);

  if (!frameImage) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  return (
    <Canvas style={[{ width, height }, style]}>
      <Image image={frameImage} x={0} y={0} width={width} height={height} fit="contain" />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#222",
  },
});
