package com.sl.signlanguage

import android.R
import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.Choreographer
import android.widget.ArrayAdapter
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import com.google.android.filament.Camera
import com.google.android.filament.Colors
import com.google.android.filament.Engine
import com.google.android.filament.EntityManager
import com.google.android.filament.LightManager
import com.google.android.filament.LightManager.ShadowOptions
import com.google.android.filament.utils.ModelViewer
import com.sl.signlanguage.databinding.ActivityTextToSignBinding
import java.nio.ByteBuffer


class TextToSignActivity : AppCompatActivity() {
    companion object {
        const val TAG = "TextToSignActivity"
        const val CROSS_FADE_INTERVAL = 0.3
    }

    private lateinit var binding: ActivityTextToSignBinding
    private lateinit var choreographer: Choreographer
    private lateinit var modelViewer: ModelViewer
    private var light = 0

    private var startTime = 0L


    val animationList = mutableListOf<Int>()
    val animationNameList = mutableListOf<String>()
    private val animationMap: HashMap<String, Int> = HashMap<String, Int>()
    val animationDurMap: HashMap<Int, Float> = HashMap<Int, Float>()

    private lateinit var phrasesMap: PhrasesMapFree
//    val phrasesMap = PhrasesMap()
    private var animationIndex = 0
    private var defaultAnimationIndex = 0
    private var lastAnimationIndex = -1
    private var playIndex = 0
    private var isFirstFrameOfPerAnimation = false

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTextToSignBinding.inflate(layoutInflater)
        setContentView(binding.root)
        choreographer = Choreographer.getInstance()
        modelViewer = ModelViewer(
            surfaceView = binding.surfaceAnimation,
            engine = Engine.create(Engine.Backend.OPENGL)
        )
        binding.surfaceAnimation.setOnTouchListener(modelViewer)
        setupLights()
//        loadGlb("animation.glb")
//        loadGlb("final-fixed-bg.glb") // the new file with a background rectangle to cover the blurred rendering
//        loadGlb("new_melody.glb") // test version of melody's avatar
        loadGlb("RTHK-weather-with-facial.glb") // RTHK final version of 350 words in 20251028

//        loadWordDB("word_db");
        loadWordDB("word_db_rthk");

        Log.d(TAG, "[t2s] Word Map Count: ${phrasesMap.dbSize}")

//        binding.textSelectSpinner.adapter =
//            ArrayAdapter(this, R.layout.simple_spinner_item, phrasesMap.keyList)


        val myCamera: Camera =
            modelViewer.engine.createCamera(modelViewer.engine.entityManager.create())
        modelViewer.view.camera = myCamera
//        val zoom = 1.4
        val zoom = 0.36 // for new_melody.glb
//        val zoom = 0.5
        val aspect = 1
        myCamera.setProjection(
            Camera.Projection.ORTHO,
            -aspect * zoom, aspect * zoom, -zoom, zoom, 0.0, 1000.0
        )
        myCamera.setShift(0.0, -0.55) // for new_melody.glb
//        myCamera.setShift(0.0, 0.8)

        for (i in 0..<modelViewer.animator?.animationCount!!) {
            val animationName = modelViewer.animator!!.getAnimationName(i)
            val animationInt = animationName.toIntOrNull() ?: -1
            var convertedName = animationName
            if (animationInt >= 0) {
                convertedName = animationInt.toString()
            }
//            Log.d(TAG, "[t2s] convert $animationName to $convertedName")

            val dur = modelViewer.animator!!.getAnimationDuration(i)
            var duplicated = ""
            if (animationMap.contains(convertedName)) {
                duplicated = "dup"
            }

            animationMap[convertedName] = i
            animationDurMap[i] = dur
            Log.d(TAG, "[t2s] animation_name : $convertedName $duplicated")
        }
        Log.d(TAG, "[t2s] Animation Count: ${modelViewer.animator?.animationCount}")

        animationIndex = animationMap["default"] ?: 0
        defaultAnimationIndex = animationIndex
        animationNameList.add(0, "default")
        toAnimationList()

        binding.confirmButton.setOnClickListener {
//            val string = binding.textSelectSpinner.selectedItem.toString()
//            Log.d(TAG, "[t2s] select value = $string")
//            animationNameList.clear()
//            animationList.clear()
//            animationNameList.add(0, "default")
//            val phraseList = phrasesMap.getAnimationNameFromSentence(string)
//            if (phraseList != null) {
//                for (i in 0..<phraseList.size) {
//                    val phrase = phraseList[i]
//                    Log.d(TAG, "[t2s] phrase value = $phrase")
//                    val animationName = phrasesMap.getFileNameFromValue(phrase)
//                    if (animationName != null) {
//                        Log.d(TAG, "[t2s] animationName value = $animationName")
//                        animationNameList.add(i + 1, animationName)
//                    }
//                }
//
//                to_Animation_list()
//                startTime = 0L
//                animationIndex = animationMap["default"] ?: 0
//            }
            Log.d(TAG, "[t2s] binding.confirmButton.setOnClickListener triggered")
        }

        binding.confirmButton2.setOnClickListener {
            Log.d(TAG, "[t2s] binding.confirmButton2.setOnClickListener triggered")

            val string = binding.textInput.text.toString()
            Log.d(TAG, "[t2s] value = $string")

            val phraseList = phrasesMap.sentenceSegment(string)
            val validList: MutableList<PhrasesMapFree.StringPair> = mutableListOf()
            var segmentationMSG = "[t2s] segmentation =:"
            for (v in phraseList) {
                segmentationMSG = segmentationMSG.plus(" (" + v.id.toString() + ", " + v.str + ")")
                if (!v.id.equals("none")) {
                    validList.add(v)
                }
            }
            Log.d(TAG, segmentationMSG)

            if (validList.size > 0) {
                animationNameList.clear()
                animationList.clear()
                animationNameList.add(0, "default")

                validList.let {
                    for (i in 0..<it.size) {
                        val animationName = validList[i].id
                        val phrase = validList[i].str
                        Log.d(TAG, "[t2s] phrase value = $phrase")
                        if (animationName != null) {
                            Log.d(TAG, "[t2s] animationName value = $animationName")
                            animationNameList.add(i + 1, animationName)
                        }
                    }
                    toAnimationList()
                }
                startTime = 0L
                animationIndex = animationMap["default"] ?: 0
            } else {
                Log.d(TAG, "[t2s] no animation to play")
            }
        }
    }

    private fun toAnimationList() {
        animationList.clear()
        for (i in 0..<animationNameList.size) {
            animationMap[animationNameList[i]]?.let { animationList.add(it) }
        }
    }

    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(currentTime: Long) {

            if (startTime == 0L) {
                startTime = System.nanoTime()
            }
            val seconds = (currentTime - startTime).toDouble() / 1_000_000_000
            if (animationIndex != defaultAnimationIndex) {
                Log.d(TAG, "[t2s-doFrame] doFrame seconds:$seconds")
                Log.d(TAG, "[t2s-doFrame] doFrame animation_index:$animationIndex")
            }
            val currentDuration = animationDurMap[animationIndex]!!
            if (seconds > currentDuration) {
                startTime = 0L
                playIndex++
                if (playIndex >= animationList.size) {
                    playIndex = 0
                    animationList.clear()
                    animationNameList.clear()
                    animationNameList.add(0, "default")
                    toAnimationList()
                }
                lastAnimationIndex = if (animationIndex == defaultAnimationIndex) {
                    -1
                } else {
                    animationIndex
                }
                animationIndex = animationList[playIndex]
                isFirstFrameOfPerAnimation = true
            }

            if (animationList.size == 0) {
                return
            }
            choreographer.postFrameCallback(this)
            modelViewer.animator?.apply {
                if (seconds > 0 && this@TextToSignActivity.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
                    if (isFirstFrameOfPerAnimation) {
                        // There seems to be an bug with Filament
                        // where it plays the last frame instead of the first frame when starting an animation.
                        // This results in an unstable transition between animations.
                        // I'm not certain about the root cause or a direct solution.
                        // However, I discovered a tricky workaround:
                        // if we skip the first frame, it surprisingly stabilizes the transition.
                        // This fucking trick is surprisingly effective! :)
                        isFirstFrameOfPerAnimation = false
                        return@apply
                    }
                    applyAnimation(animationIndex, seconds.toFloat())
                    if (animationIndex != defaultAnimationIndex) {
                        Log.d(TAG, "[t2s-doFrame] doFrame current idx: ${animationIndex}, time: ${seconds}")
                    }
                    if (lastAnimationIndex >= 0 && seconds <= CROSS_FADE_INTERVAL) {
//                      val remainingTime = animationDurMap[lastAnimationIndex]!! - CROSS_FADE_INTERVAL + seconds
                        val remainingTime = animationDurMap[lastAnimationIndex]!! - seconds
                        val ratio = (seconds / CROSS_FADE_INTERVAL).toFloat()
                        applyCrossFade(lastAnimationIndex, remainingTime.toFloat(), ratio)
                        if (animationIndex != defaultAnimationIndex) {
                            Log.d(
                                TAG,
                                "[t2s-doFrame] doFrame Last idx: ${lastAnimationIndex}, remaining time: ${remainingTime}, ratio = ${ratio}"
                            )
                        }
                    }
                    updateBoneMatrices()
                }
            }
            modelViewer.render(currentTime)
        }
    }

    override fun onResume() {
        super.onResume()
        choreographer.postFrameCallback(frameCallback)
    }

    override fun onPause() {
        super.onPause()
        choreographer.removeFrameCallback(frameCallback)
    }

    override fun onDestroy() {
        super.onDestroy()
        choreographer.removeFrameCallback(frameCallback)
    }

    private fun loadGlb(name: String) {
        val buffer = readAsset(name)
        modelViewer.loadModelGlb(buffer)
        modelViewer.transformToUnitCube()
    }

    private fun loadWordDB(name: String) {
        val buffer = readAssetText(name)
        phrasesMap = PhrasesMapFree(buffer)
    }

    private fun readAsset(assetName: String): ByteBuffer {
        val input = assets.open(assetName)
        val bytes = ByteArray(input.available())
        input.read(bytes)
        return ByteBuffer.wrap(bytes)
    }

    private fun readAssetText(assetName: String): String {
        val input = assets.open(assetName)
        val buffer = input.bufferedReader().use {
            it.readText()
        }
        return buffer
    }

    private fun setupLights() {
        light = EntityManager.get().create()

        val shadowOptions = LightManager.ShadowOptions()
        shadowOptions.maxShadowDistance = 0f

        // Create a color from a temperature (D65)
        val (r, g, b) = Colors.cct(6_500.0f)
        LightManager.Builder(LightManager.Type.DIRECTIONAL)
                .color(r, g, b)
                // Intensity of the sun in lux on a clear day
                .intensity(220_000.0f)
                // The direction is normalized on our behalf
                .direction(-0f, -0.5f, -1f)
                .shadowOptions(shadowOptions)
                .build(modelViewer.engine, light)

        // Add the entity to the scene to light it
        modelViewer.scene.addEntity(light)
    }
}