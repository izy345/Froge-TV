package expo.modules.emotegifencoder

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.promise.Promise
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import android.util.Base64
import pl.droidsonroids.gif.GifEncoder
import java.io.OutputStream

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

        // Create output GIF file
        val outputDir = appContext.reactContext?.cacheDir ?: File("/tmp")
        val outputFile = File.createTempFile("emote_", ".gif", outputDir)
        val outputStream: OutputStream = FileOutputStream(outputFile)

        val gifEncoder = GifEncoder(outputStream, bitmaps[0].width, bitmaps[0].height, 0)

        for (i in bitmaps.indices) {
          gifEncoder.addFrame(bitmaps[i])
          gifEncoder.setDelay(durations[i])
        }

        gifEncoder.finishEncoding()
        outputStream.flush()
        outputStream.close()

        promise.resolve(outputFile.absolutePath)
      } catch (e: Exception) {
        promise.reject("ENCODE_ERROR", e.message ?: "Failed to encode GIF")
      }
    }
  }
}
