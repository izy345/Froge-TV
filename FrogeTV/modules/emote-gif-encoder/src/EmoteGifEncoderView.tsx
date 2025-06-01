import { requireNativeView } from 'expo';
import * as React from 'react';

import { EmoteGifEncoderViewProps } from './EmoteGifEncoder.types';

const NativeView: React.ComponentType<EmoteGifEncoderViewProps> =
  requireNativeView('EmoteGifEncoder');

export default function EmoteGifEncoderView(props: EmoteGifEncoderViewProps) {
  return <NativeView {...props} />;
}
