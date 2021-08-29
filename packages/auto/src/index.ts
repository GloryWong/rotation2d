import { Merge, ValueOf, SetOptional } from 'type-fest'
import { BaseRotation2d, BaseOptions, El, Action } from '../../base'
import Timer from '@gloxy/timer'

export type AutoOptions = Merge<BaseOptions, {}>
export type Transition = SetOptional<{
  targetAngle: number
  speed: number
}>

export class AutoRotation2d extends BaseRotation2d {
  private timer = new Timer({
    stepSize: this.stepAngle,
  })

  private transition: Transition = {
    targetAngle: 0,
    speed: 1,
  }

  constructor(el: El, options: AutoOptions = {}) {
    super(el, options)
    this.initTimer()
  }

  protected initTimer() {
    this.timer.addCallbacks({
      running: ({ counter }) => {
        // console.log(counter)
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

  /// API ///

  setTransition(transition: Transition) {
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

    // console.log('from', this.angle, 'to', this.transition.targetAngle)

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

  transitFromTo(
    fromAngle: number,
    toAngle: ValueOf<Transition, 'targetAngle'>
  ) {
    this.angle = fromAngle
    this.transitTo(toAngle)
  }

  transitTo(
    angle: ValueOf<Transition, 'targetAngle'>,
    { speed }: { speed?: ValueOf<Transition, 'speed'> } = {}
  ) {
    this.setTransition({ targetAngle: angle, speed })
    this.startTransition()

    return this
  }
}
