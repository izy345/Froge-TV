import * as React from 'react';

import { EmoteGifEncoderViewProps } from './EmoteGifEncoder.types';

export default function EmoteGifEncoderView(props: EmoteGifEncoderViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
