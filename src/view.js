


const config = {
  video: { width: 1280, height: 720, fps: 60 }
}

export class View {

  #video
  #handCanvas
  #drawCanvas
  constructor() {
    this.#video = document.querySelector(".video")
    this.#handCanvas = document.querySelector(".hand-canvas")
    this.#drawCanvas = document.querySelector(".draw-canvas")


    if (!this.#video || !this.#handCanvas || !this.#drawCanvas) {
      throw new Error("Not all elements are found")
    }


    this.#handCanvas.width = config.video.width
    this.#handCanvas.height = config.video.height

    this.#drawCanvas.width = config.video.width;
    this.#drawCanvas.height = config.video.height;


  }


  async config() {


    await this.initCam(
      config.video.width,
      config.video.width,
      config.video.fps
    )


    const videoRect = this.#video.getBoundingClientRect();
    [this.#handCanvas, this.#drawCanvas].forEach(canvas => {
      canvas.style.width = videoRect.width + "px";
      canvas.style.height = videoRect.height + "px";
      canvas.width = this.#video.videoWidth;
      canvas.height = this.#video.videoHeight;
    });
    this.#video.play()

    const drawCtx = this.#drawCanvas.getContext("2d")
    this.#configDrawCanvas(drawCtx)
  }





  async initCam(width, height, fps) {

    const constraints = {
      audio: false,
      video: {
        facingMode: "user",
        width: width,
        height: height,
        frameRate: { max: fps }
      }
    }

    this.#video.width = width
    this.#video.height = height


    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    this.#video.srcObject = stream

    return new Promise(resolve => {
      this.#video.onloadedmetadata = () => { resolve(this.#video) }
    })
  }

  getVideo() {
    return this.#video
  }

  async #configDrawCanvas(drawCtx) {
    drawCtx.strokeStyle = "#FF0000";
    drawCtx.lineWidth = 4;
    drawCtx.lineCap = "round";
  }


  cleanHandCanvas() {
    const handCtx = this.#handCanvas.getContext("2d")
    handCtx.clearRect(0, 0, config.video.width, config.video.height)
  }

  setInDrawModeDrawCanvas() {
    const drawCtx = this.#drawCanvas.getContext("2d")
    drawCtx.globalCompositeOperation = "source-over";
    drawCtx.strokeStyle = "#FFFF00";
    drawCtx.lineWidth = 4;
  }

  setInEraseModeDrawCanvas() {
    const drawCtx = this.#drawCanvas.getContext("2d")
    drawCtx.globalCompositeOperation = "destination-out";
    drawCtx.lineWidth = 100;
  }

  updateStatusText(status) {
    const statusText = document.querySelector(".status");

    switch (status) {
      case "NORMAL":
        statusText.textContent = "Mode: Normal"
        break;
      case "DRAW":
        statusText.textContent = "Mode: Draw"
        break;
      case "ERASE":
        statusText.textContent = "Mode: Erase"
        break;
    }
  }


  drawPointInHandCanvas(x, y, r, color) {
    const handCtx = this.#handCanvas.getContext("2d")
    this.drawPoint(handCtx, x, y, r, color)
  }

  drawPoint(ctx, x, y, r, color) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
  }


  drawPathInDrawCanvas(props) {
    const drawCtx = this.#drawCanvas.getContext("2d")
    this.drawPath(drawCtx, props)
  }


  drawPath(ctx, { currentX, currentY, newX, newY }) {
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
  }




}