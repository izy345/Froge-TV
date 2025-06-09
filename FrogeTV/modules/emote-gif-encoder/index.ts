// Reexport the native module. On web, it will be resolved to EmoteGifEncoderModule.web.ts
// and on native platforms to EmoteGifEncoderModule.ts
export { default } from './src/EmoteGifEncoderModule';
export { default as EmoteGifEncoderView } from './src/EmoteGifEncoderView';
export * from  './src/EmoteGifEncoder.types';
