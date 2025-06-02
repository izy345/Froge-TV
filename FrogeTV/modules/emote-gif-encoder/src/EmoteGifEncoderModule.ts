import { NativeModule, requireNativeModule } from 'expo';

import { EmoteGifEncoderModuleEvents } from './EmoteGifEncoder.types';

declare class EmoteGifEncoderModule extends NativeModule<EmoteGifEncoderModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;

  /**
   * Encodes a GIF from base64 image frames and their durations.
   * @param frames Array of base64-encoded PNG image strings
   * @param durations Array of durations (in ms) for each frame
   * @returns The path to the generated GIF
   */
  encodeGif(frames: string[], durations: number[]): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<EmoteGifEncoderModule>('EmoteGifEncoder');
