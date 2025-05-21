import React, { useState, useEffect } from 'react';
import { Image } from 'expo-image';

// A simple shared store using a Map keyed by source URI.
const sharedAnimationStore = new Map();

// Custom hook to get or create a shared animation controller.
function useSharedAnimation(sourceUri, isSynced) {
  const [controller, setController] = useState(null);

  useEffect(() => {
    if (isSynced && sourceUri) {
      if (sharedAnimationStore.has(sourceUri)) {
        setController(sharedAnimationStore.get(sourceUri));
      } else {
        const newController = createAnimationController();
        sharedAnimationStore.set(sourceUri, newController);
        setController(newController);
      }
    }
    // Note: In a production scenario you should remove the controller
    // from sharedAnimationStore when no longer used.
  }, [sourceUri, isSynced]);

  return controller;
}

// Create an animation controller object.
// Replace the methods with actual animation control as needed.
function createAnimationController() {
  return {
    start: () => console.log('Animation started'),
    stop: () => console.log('Animation stopped'),
    // Example property; you can tie this to an actual animated value.
    currentFrame: 0,
  };
}

export default function AnimatedImage({ source, isSynced, ...props }) {
  const animationController = useSharedAnimation(source?.uri, isSynced);

  useEffect(() => {
    if (animationController) {
      // Example action: Start the shared animation.
      animationController.start();
    }
  }, [animationController]);

  return (
    <Image
      {...props}
      source={source}
    />
  );
}

export { sharedAnimationStore };