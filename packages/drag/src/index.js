import { BaseRotation2d, Action } from '@gloxy/rotation2d-base'
export class DragRotation2d extends BaseRotation2d {
  interactionEl = document.body
  circular = true
  startAngle = 0
  flyingAngle = 0
  rotating = false
  rotatingProxy
  options = {}
  constructor(el, options = {}) {
    super(el, options)
    this.options = options
    options.interactionEl &&
      (this.interactionEl = BaseRotation2d.parseElement(options.interactionEl))
    options.circular !== undefined && (this.circular = options.circular)
    this.rotatingProxy = BaseRotation2d.observer(this.rotating)
    this.registerEventHandlers()
  }
  static getEventPos(event) {
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
  computeFlyingAngle(angleChange) {
    const forcast = this.angle + angleChange
    if (!this.circular) {
      if (forcast < 0) return 0
      if (forcast > 360) return 360
    }
    return this.roundAngle(BaseRotation2d.modeAngle(forcast))
  }
  createCallbackParams(params) {
    return {
      ...super.createCallbackParams(),
      startAngle: this.startAngle,
      flyingAngle: this.flyingAngle,
      ...params,
    }
  }
  readyRotate(pos) {
    this.options.initialAngle &&
      (this.angle = this.parseInitialAngle(this.options.initialAngle))
    this.rotating = this.rotatingProxy.value = true
    this.startAngle = this.computeAngleToCenter(pos)
    return this.invokeCallbacks(Action.READY_ROTATE)
  }
  rotate(pos) {
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
  handleStart(event) {
    event.preventDefault()
    return this.readyRotate(DragRotation2d.getEventPos(event))
  }
  handleMove(event) {
    event.preventDefault()
    return this.rotate(DragRotation2d.getEventPos(event))
  }
  handleStop(event) {
    event.preventDefault()
    return this.stopRotate()
  }
  registerEventHandlers() {
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
