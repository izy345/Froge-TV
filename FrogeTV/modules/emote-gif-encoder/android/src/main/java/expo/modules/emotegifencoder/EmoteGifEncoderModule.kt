package expo.modules.emotegifencoder

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

class EmoteGifEncoderModule : Module() {              // remove the AppContext constructor
  override fun definition() = ModuleDefinition {
    Name("EmoteGifEncoder")

    AsyncFunction("encodeGif") { frames: List<String>, durations: List<Int>, promise: Promise ->
      if (frames.size != durations.size) {
        promise.reject("MISMATCH", "Number of frames and durations must match.", null)
        return@AsyncFunction
      }

      thread {
        try {
          // decode Base64 → Bitmaps
          val bitmaps = frames.mapIndexed { i, b64 ->
            Base64.decode(b64, Base64.DEFAULT).let { bytes ->
              BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ?: throw IllegalArgumentException("Invalid image at index $i")
            }
          }

          // use the inherited appContext to get cacheDir
          val reactContext = appContext.reactContext
          if (reactContext == null) {
            runOnUiThread {
              promise.reject("NO_CONTEXT", "React context is not available", null)
            }
            return@thread
          }

          val tempGif = File(reactContext.cacheDir, "emotegif_${System.currentTimeMillis()}.gif")


          // init native GifEncoder
          val encoder = GifEncoder().apply {
            init(
              bitmaps[0].width,
              bitmaps[0].height,
              tempGif.absolutePath,
              GifEncoder.EncodingType.ENCODING_TYPE_SIMPLE_FAST
            )
          }

          // add frames + delays
          bitmaps.forEachIndexed { i, bmp ->
            if (!encoder.encodeFrame(bmp, durations[i])) {
              throw RuntimeException("Failed to encode frame $i")
            }
          }
          encoder.close()

          // read bytes, delete file, Base64 encode
          val gifBytes = tempGif.readBytes()
          tempGif.delete()
          val result = Base64.encodeToString(gifBytes, Base64.NO_WRAP)

          // resolve on UI thread
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