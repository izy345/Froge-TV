import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './EmoteGifEncoder.types';

type EmoteGifEncoderModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class EmoteGifEncoderModule extends NativeModule<EmoteGifEncoderModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(EmoteGifEncoderModule);
