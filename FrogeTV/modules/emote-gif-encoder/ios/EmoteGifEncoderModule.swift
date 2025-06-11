import ExpoModulesCore
import UIKit
import ImageIO
import MobileCoreServices

public class EmoteGifEncoderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("EmoteGifEncoder")

    AsyncFunction("encodeGif") { (base64Frames: [String], durations: [Double]) -> String in
      let data = NSMutableData()

      guard let destination = CGImageDestinationCreateWithData(data as CFMutableData, kUTTypeGIF, base64Frames.count, nil) else {
        throw NSError(domain: "EmoteGifEncoder", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to create GIF destination"])
      }

      // Set global GIF properties BEFORE adding frames
      let gifProperties = [
        kCGImagePropertyGIFDictionary: [
          kCGImagePropertyGIFLoopCount: 0  // Loop infinitely
        ]
      ] as CFDictionary
      CGImageDestinationSetProperties(destination, gifProperties)

      for (index, base64String) in base64Frames.enumerated() {
        guard let imageData = Data(base64Encoded: base64String),
              let image = UIImage(data: imageData),
              let cgImage = image.cgImage else {
          continue
        }

        let delayTime = durations[index] / 1000.0

        // Frame properties only need delay time
        let frameProps: CFDictionary = [
          kCGImagePropertyGIFDictionary: [
            kCGImagePropertyGIFDelayTime: delayTime,
            kCGImagePropertyGIFUnclampedDelayTime: delayTime
          ]
        ] as CFDictionary

        CGImageDestinationAddImage(destination, cgImage, frameProps)
      }

      if CGImageDestinationFinalize(destination) {
        let base64EncodedGif = data.base64EncodedString()
        return base64EncodedGif
      } else {
        throw NSError(domain: "EmoteGifEncoder", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to finalize GIF"])
      }
    }
  }
}
