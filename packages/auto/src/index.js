import { BaseRotation2d, Action } from '@gloxy/rotation2d-base'
import Timer from '@gloxy/timer'
export class AutoRotation2d extends BaseRotation2d {
  timer = new Timer({
    stepSize: this.stepAngle,
  })
  transition = {
    targetAngle: 0,
    speed: 1,
  }
  constructor(el, options = {}) {
    super(el, options)
    this.initTimer()
  }
  initTimer() {
    this.timer.addCallbacks({
      running: ({ counter }) => {
        this.angle = counter
        this.setCssTransformRotate(this.angle).invokeCallbacks(Action.ROTATE)
      },
      finished: () => {
        this.rotating = false
        this.invokeCallbacks(Action.STOP_ROTATE)
      },
    })
    return this
  }
  setTransition(transition) {
    this.transition = {
      ...this.transition,
      ...transition,
    }
    return this
  }
  startTransition() {
    this.options.initialAngle &&
      (this.angle = this.parseInitialAngle(this.options.initialAngle))
    if (this.transition.targetAngle === this.angle) {
      return this
    }
    this.timer.setOptoins({
      from: this.angle,
      to: this.transition.targetAngle,
      speed: this.transition.speed,
    })
    this.rotating = true
    this.invokeCallbacks(Action.READY_ROTATE)
    this.timer.start()
    return this
  }
  pauseTransition() {
    this.timer.pause()
    return this
  }
  resumeTransition() {
    this.timer.resume()
    return this
  }
  transitFromTo(fromAngle, toAngle) {
    this.angle = fromAngle
    this.transitTo(toAngle)
  }
  transitTo(angle, { speed } = {}) {
    this.setTransition({ targetAngle: angle, speed })
    this.startTransition()
    return this
  }
}
