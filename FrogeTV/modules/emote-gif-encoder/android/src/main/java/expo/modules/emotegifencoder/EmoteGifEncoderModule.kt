package expo.modules.emotegifencoder

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.promise.Promise
import android.util.Base64
import pl.droidsonroids.gif.GifEncoder
import java.io.ByteArrayOutputStream

class EmoteGifEncoderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EmoteGifEncoder")

    Constants("PI" to Math.PI)

    AsyncFunction("encodeGif") { frames: List<String>, durations: List<Int>, promise: Promise ->
      try {
        if (frames.size != durations.size) {
          promise.reject("MISMATCH", "Number of frames and durations must match.")
          return@AsyncFunction
        }

        // Decode base64 images into Bitmaps
        val bitmaps = frames.map { base64 ->
          val decodedBytes = Base64.decode(base64, Base64.DEFAULT)
          BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
        }

        // Use in-memory output stream instead of file
        val outputStream = ByteArrayOutputStream()
        val gifEncoder = GifEncoder(outputStream, bitmaps[0].width, bitmaps[0].height, 0)

        for (i in bitmaps.indices) {
          gifEncoder.addFrame(bitmaps[i])
          gifEncoder.setDelay(durations[i])
        }

        gifEncoder.finishEncoding()
        outputStream.flush()

        // Convert to Base64 and return
        val gifBytes = outputStream.toByteArray()
        val base64Gif = Base64.encodeToString(gifBytes, Base64.NO_WRAP)
        outputStream.close()

        promise.resolve(base64Gif)
      } catch (e: Exception) {
        promise.reject("ENCODE_ERROR", e.message ?: "Failed to encode GIF")
      }
    }
  }
}
