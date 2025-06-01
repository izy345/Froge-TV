import { NativeModule, requireNativeModule } from 'expo';

import { EmoteGifEncoderModuleEvents } from './EmoteGifEncoder.types';

declare class EmoteGifEncoderModule extends NativeModule<EmoteGifEncoderModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<EmoteGifEncoderModule>('EmoteGifEncoder');
