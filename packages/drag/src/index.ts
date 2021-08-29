import { JsonValue, Merge, Primitive } from 'type-fest'
import {
  BaseRotation2d,
  Pos,
  Action,
  CallbackParams,
  El,
  BaseOptions,
} from '../../base'

export type InteractionEvent = MouseEvent | TouchEvent

export type DragCallbackParams = Merge<
  CallbackParams,
  {
    startAngle: number
    flyingAngle: number
  }
>

/// consturctor parameters ///
export type InteractionEl = HTMLElement | string
export type DragOptions = Merge<
  BaseOptions,
  {
    interactionEl?: HTMLElement
    circular?: boolean
  }
>

export class DragRotation2d extends BaseRotation2d {
  protected interactionEl: HTMLElement = document.body

  protected circular = true

  protected startAngle = 0

  protected flyingAngle = 0

  protected rotating = false

  protected rotatingProxy: any

  protected options: DragOptions = {}

  constructor(el: El, options: DragOptions = {}) {
    super(el, options)
    this.options = options
    options.interactionEl &&
      (this.interactionEl = BaseRotation2d.parseElement(options.interactionEl))
    options.circular !== undefined && (this.circular = options.circular)

    this.rotatingProxy = BaseRotation2d.observer(this.rotating)
    this.registerEventHandlers()
  }

  static getEventPos(event: InteractionEvent): Pos {
    let interactionDot
    if (event instanceof TouchEvent) {
      interactionDot = event.touches[0]
    } else {
      interactionDot = event
    }

    return {
      x: interactionDot.clientX,
      y: interactionDot.clientY,
    }
  }

  protected computeFlyingAngle(angleChange: number): number {
    const forcast = this.angle + angleChange

    if (!this.circular) {
      if (forcast < 0) return 0
      if (forcast > 360) return 360
    }

    return this.roundAngle(BaseRotation2d.modeAngle(forcast))
  }

  /// callbacks ///

  protected createCallbackParams(params?: CallbackParams): CallbackParams {
    return {
      ...super.createCallbackParams(),
      startAngle: this.startAngle,
      flyingAngle: this.flyingAngle,
      ...params,
    }
  }

  /// methods ///

  readyRotate(pos: Pos) {
    this.options.initialAngle &&
      (this.angle = this.parseInitialAngle(this.options.initialAngle))
    this.rotating = this.rotatingProxy.value = true
    this.startAngle = this.computeAngleToCenter(pos)

    return this.invokeCallbacks(Action.READY_ROTATE)
  }

  rotate(pos: Pos) {
    if (!this.rotating) {
      return this
    }

    const currentAngle = this.computeAngleToCenter(pos)

    const angleChange = currentAngle - this.startAngle

    this.flyingAngle = this.computeFlyingAngle(angleChange)

    return this.setCssTransformRotate(this.flyingAngle).invokeCallbacks(
      Action.ROTATE
    )
  }

  stopRotate() {
    if (!this.rotating) {
      return this
    }

    this.rotating = this.rotatingProxy.value = false
    this.angle = this.flyingAngle

    return this.invokeCallbacks(Action.STOP_ROTATE)
  }

  /// / UI use ///

  protected handleStart(event: InteractionEvent) {
    event.preventDefault()
    return this.readyRotate(DragRotation2d.getEventPos(event))
  }

  protected handleMove(event: InteractionEvent) {
    event.preventDefault()
    return this.rotate(DragRotation2d.getEventPos(event))
  }

  protected handleStop(event: InteractionEvent) {
    event.preventDefault()
    return this.stopRotate()
  }

  protected registerEventHandlers() {
    this.interactionEl.addEventListener(
      'mousedown',
      this.handleStart.bind(this)
    )
    this.interactionEl.addEventListener('mousemove', this.handleMove.bind(this))
    this.interactionEl.addEventListener('mouseup', this.handleStop.bind(this))
    this.interactionEl.addEventListener(
      'mouseleave',
      this.handleStop.bind(this)
    )
    this.interactionEl.addEventListener(
      'touchstart',
      this.handleStart.bind(this)
    )
    this.interactionEl.addEventListener('touchmove', this.handleMove.bind(this))
    this.interactionEl.addEventListener('touchend', this.handleStop.bind(this))
    return this
  }
}
