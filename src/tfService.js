import "https://unpkg.com/@tensorflow/tfjs-core@3.7.0/dist/tf-core.js"
import "https://unpkg.com/@tensorflow/tfjs-backend-webgl@3.7.0/dist/tf-backend-webgl.js"
import "https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.0.0/dist/hand-pose-detection.js"
import "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.min.js"
import "https://cdn.jsdelivr.net/npm/fingerpose@0.1.0/dist/fingerpose.min.js"

export class TFService {

  #detector
  #GE
  constructor() {

    this.#GE = null
  }

  async config() {
    this.#detector = await this.#createDetector()
    if (!this.#detector) {
      throw new Error("Detector is not created")
    }
  }
  getDetector() {
    return this.#detector
  }

  #createDetector() {
    return window.handPoseDetection.createDetector(
      window.handPoseDetection.SupportedModels.MediaPipeHands,
      {
        runtime: "mediapipe",
        modelType: "full",
        maxHands: 2,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,
      }
    )
  }

  configGestEstimator(knownGestures) {
    this.#GE = new fp.GestureEstimator(knownGestures)
    return this.#GE
  }


  async estimateHands(video, options) {
    const hands = await this.#detector.estimateHands(video, options)
    return hands
  }

  async getHandPrediction(hand) {
    const keypoints3D = hand.keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
    if (!this.#GE) {
      throw new Error("Gesture Estimator is not configured")
    }

    const result = await this.#GE.estimate(keypoints3D, 9)
    return result
  }
}