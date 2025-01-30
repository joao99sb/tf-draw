
import { gestures } from "./gestures.js"
import { TFService } from "./tfService.js"
import { View } from "./view.js"
import { App } from "./app.js"


async function main() {

  const tfService = new TFService()
  await tfService.config()

  const knownGestures = [
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture,
    ...gestures
  ]

  tfService.configGestEstimator(knownGestures)

  const view = new View()
  await view.config()

  const app = new App({
    view,
    tfService
  })

  await app.start()

}


window.addEventListener("DOMContentLoaded", () => {
  main()
})