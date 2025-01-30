const handStatusList = ['NORMAL', "DRAW", "ERASE"]



export class App {


  #handStatus
  #sholdRestartPoints
  #currentY
  #currentX
  constructor({
    view,
    tfService
  }) {
    this.view = view
    this.tfService = tfService
    this.#handStatus = handStatusList[0]
    this.#sholdRestartPoints = true

    this.#currentX = 0
    this.#currentY = 0
  }


  async start() {
    await this.loop()
  }

  async loop() {
    this.view.cleanHandCanvas()

    const video = this.view.getVideo()

    const hands = await this.tfService.estimateHands(video, {
      flipHorizontal: true
    })
    // TODO: one thread for each hand
    for (const hand of hands) {

      const chosenHand = hand.handedness.toLowerCase()

      const predictions = await this.tfService.getHandPrediction(hand)
      if (!predictions.gestures.length) continue;

      const result = predictions.gestures.reduce((p, c) => (p.score > c.score) ? p : c)


      if (chosenHand == 'left') {
        this.handleLeftHand(result)
        this.view.updateStatusText(this.#handStatus)
      }

      if (chosenHand === 'right') {
        this.handleRightHand(hand.keypoints)
      }

    }

    setTimeout(async () => { await this.loop() }, 10)
  }

  isInOrigin() {
    return this.#currentX == 0 && this.#currentY == 0
  }



  handleLeftHand(result) {
    if (result.name == "paper") {
      this.#handStatus = handStatusList[1]
      this.view.setInDrawModeDrawCanvas()

    }
    else if (result.name == "scissors") {
      this.#handStatus = handStatusList[2]
      this.view.setInEraseModeDrawCanvas()
      this.#sholdRestartPoints = true;

    } else {
      this.#handStatus = handStatusList[0]
      this.#sholdRestartPoints = true;

    }
  }

  handleRightHand(keypoints) {

    for (const keypoint of keypoints) {
      if (keypoint.name !== "index_finger_tip") continue

      this.view.drawPointInHandCanvas(keypoint.x, keypoint.y, 8, "blue")

      if (this.#sholdRestartPoints) {
        this.#currentX = keypoint.x
        this.#currentY = keypoint.y
        this.#sholdRestartPoints = false;
      }

      if (this.isInOrigin()) continue;

      this.drawInCanvas(keypoint.x, keypoint.y)
    }


  }

  drawInCanvas(newX, newY) {
    switch (this.#handStatus) {
      case handStatusList[0]:
        break;
      case handStatusList[1]:
      case handStatusList[2]:

        this.view.drawPathInDrawCanvas({
          currentX: this.#currentX,
          currentY: this.#currentY,
          newX,
          newY,
        })

        this.#currentX = newX
        this.#currentY = newY

        break;

    }

  }

}