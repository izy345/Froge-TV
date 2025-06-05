package expo.modules.emotegifencoder

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.squareup.gifencoder.GifEncoder
import com.squareup.gifencoder.ImageOptions
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

class EmoteGifEncoderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EmoteGifEncoder")

    Constants("PI" to Math.PI)

    AsyncFunction("encodeGif") { frames: List<String>, durations: List<Int>, promise: Promise ->
      try {
        if (frames.size != durations.size) {
          promise.reject("MISMATCH", "Number of frames and durations must match.", null)
          return@AsyncFunction
        }

        // Decode base64 images into Bitmaps
        val bitmaps = frames.map { base64 ->
          val decodedBytes = Base64.decode(base64, Base64.DEFAULT)
          BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
        }

        // Setup GIF encoder
        val outputStream = ByteArrayOutputStream()
        val width = bitmaps[0].width
        val height = bitmaps[0].height
        val gifEncoder = GifEncoder(outputStream, width, height, 0)

        for (i in bitmaps.indices) {
          val bitmap = bitmaps[i]
          val rgbArray = bitmapToRgbArray(bitmap)
          val options = ImageOptions()
          options.setDelay(durations[i].toLong(), TimeUnit.MILLISECONDS)
          gifEncoder.addImage(rgbArray, options)
        }

        gifEncoder.finishEncoding()
        outputStream.flush()

        // Convert to Base64 and return
        val gifBytes = outputStream.toByteArray()
        val base64Gif = Base64.encodeToString(gifBytes, Base64.NO_WRAP)
        outputStream.close()

        promise.resolve(base64Gif)
      } catch (e: Exception) {
        promise.reject("ENCODE_ERROR", e.message ?: "Failed to encode GIF", e)
      }
    }
  }

  // Helper function to convert Bitmap to 2D RGB array
  private fun bitmapToRgbArray(bitmap: Bitmap): Array<IntArray> {
    val width = bitmap.width
    val height = bitmap.height
    val pixels = IntArray(width * height)
    bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

    val rgbArray = Array(height) { IntArray(width) }
    for (y in 0 until height) {
      for (x in 0 until width) {
        val pixel = pixels[y * width + x]
        val r = (pixel shr 16) and 0xFF
        val g = (pixel shr 8) and 0xFF
        val b = pixel and 0xFF
        rgbArray[y][x] = (r shl 16) or (g shl 8) or b
      }
    }
    return rgbArray
  }
}
