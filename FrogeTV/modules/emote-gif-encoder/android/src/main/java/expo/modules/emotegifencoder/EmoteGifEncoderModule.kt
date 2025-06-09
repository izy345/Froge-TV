package expo.modules.emotegifencoder

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Handler
import android.os.Looper
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.waynejo.androidndkgif.GifEncoder
import java.io.File
import kotlin.concurrent.thread

class EmoteGifEncoderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EmoteGifEncoder")

    AsyncFunction("encodeGif") { frames: List<String>, durations: List<Int>, promise: Promise ->
      if (frames.size != durations.size) {
        promise.reject("MISMATCH", "Number of frames and durations must match.", null)
        return@AsyncFunction
      }

      thread {
        try {
          val bitmaps = frames.mapIndexed { i, b64 ->
            val bytes = Base64.decode(b64, Base64.DEFAULT)
            val decoded = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
              ?: throw IllegalArgumentException("Invalid image at index $i")

            // Ensure bitmap supports alpha
            decoded.copy(Bitmap.Config.ARGB_8888, false)
          }

          val reactContext = appContext.reactContext
          if (reactContext == null) {
            runOnUiThread {
              promise.reject("NO_CONTEXT", "React context is not available", null)
            }
            return@thread
          }

          val tempGif = File(reactContext.cacheDir, "emotegif_${System.currentTimeMillis()}.gif")

          val encoder = GifEncoder().apply {
            init(
              bitmaps[0].width,
              bitmaps[0].height,
              tempGif.absolutePath,
              GifEncoder.EncodingType.ENCODING_TYPE_SIMPLE_FAST
            )
          }

          bitmaps.forEachIndexed { i, bmp ->
            if (!encoder.encodeFrame(bmp, durations[i])) {
              throw RuntimeException("Failed to encode frame $i")
            }
          }
          encoder.close()

          val gifBytes = tempGif.readBytes()
          tempGif.delete()
          val result = Base64.encodeToString(gifBytes, Base64.NO_WRAP)

          runOnUiThread { promise.resolve(result) }
        } catch (e: Exception) {
          runOnUiThread { promise.reject("ENCODE_ERROR", e.message, e) }
        }
      }
    }
  }

  private fun runOnUiThread(action: () -> Unit) {
    Handler(Looper.getMainLooper()).post { action() }
  }
}
