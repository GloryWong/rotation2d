import { JsonValue, Merge, Primitive } from 'type-fest'

export type Pos = {
  x: number
  y: number
}

export enum Action {
  READY_ROTATE = 'readyRotate',
  ROTATE = 'rotate',
  STOP_ROTATE = 'stopRotate',
}

export type CallbackParams = {
  el: El
  rotationOriginPos: Pos
  angle: number
  rotating: boolean
  [extra: string]: JsonValue | Primitive | HTMLElement
}
export type Callback = (callbackParams: CallbackParams) => void
export type Callbacks = Callback | Array<Callback> | Set<Callback>
export type CallbackCollection = Partial<Record<Action, Callbacks>>
type InnerCallbackCollection = Record<Action, Set<Callback>>

/// consturctor parameters ///
export type El = HTMLElement | string
type InitialAngle = number | (() => number)
export type BaseOptions = {
  initialAngle?: InitialAngle
  rotationOriginPos?: Pos // Client Position
  callbackCollection?: CallbackCollection
  stepAngle?: number
}

export abstract class BaseRotation2d {
  static R2D = 180 / Math.PI

  protected el: HTMLElement
  protected angle: number = 0
  protected rotationOriginPos: Pos
  protected stepAngle: number = 1
  protected rotating: boolean = false

  protected options: BaseOptions = {}

  protected innerCallbackCollection: InnerCallbackCollection = {
    [Action.READY_ROTATE]: new Set<Callback>(),
    [Action.ROTATE]: new Set<Callback>(),
    [Action.STOP_ROTATE]: new Set<Callback>(),
  }

  constructor(el: El, options: BaseOptions = {}) {
    this.options = options

    this.el = BaseRotation2d.parseElement(el)
    options.initialAngle &&
      (this.angle = this.parseInitialAngle(options.initialAngle))
    this.rotationOriginPos =
      options.rotationOriginPos || BaseRotation2d.getCenterPos(this.el)
    options.stepAngle &&
      (this.stepAngle = BaseRotation2d.modeAngle(options.stepAngle))
    options.callbackCollection && this.addCallbacks(options.callbackCollection)

    this.init()
  }

  protected parseInitialAngle(initialAngle: InitialAngle): number {
    return typeof initialAngle === 'number'
      ? BaseRotation2d.modeAngle(initialAngle)
      : initialAngle()
  }

  static observer(variable: Primitive) {
    type Callback = (oldValue: Primitive, newValue: Primitive) => void
    type Callbacks = Callback | Callback[]
    return new Proxy(
      {
        value: variable as Primitive,
        callbacks: new Set<Callback>() as Readonly<Set<Callback>>,
        addCallbacks: function (callbacks: Callbacks) {
          if (Array.isArray(callbacks)) {
            callbacks.forEach((cb) => this.callbacks.add(cb))
          } else {
            this.callbacks.add(callbacks)
          }
        },
      },
      {
        set(obj, prop, value: Primitive) {
          if (obj.value !== value) {
            obj.callbacks.forEach((cb) => cb(value, obj.value))
            obj.value = value
          }
          return true
        },
        get: (obj, prop: string) => {
          if (prop === 'value') return obj.value
          if (prop === 'callbacks') return obj.callbacks
          if (prop === 'addCallbacks') return obj.addCallbacks
        },
      }
    )
  }

  static parseElement(el: El) {
    let _el
    if (typeof el === 'string') {
      _el = document.querySelector<HTMLElement>(el)
      if (_el === null) {
        throw Error(`${el} is not a valid selector`)
      }
    } else {
      _el = el
    }

    return _el
  }

  protected init() {
    return this.setRoundedTransformRotate(this.angle)
  }

  static getCenterPos(el: HTMLElement): Pos {
    const { left, top, width, height } = el.getBoundingClientRect()
    return {
      x: left + width / 2,
      y: top + height / 2,
    }
  }

  static modeAngle(angle: number): number {
    angle %= 360
    angle < 0 && (angle += 360)
    return angle
  }

  protected roundAngle(angle: number): number {
    return Math.round(angle / this.stepAngle) * this.stepAngle
  }

  static convertRadianToDegree(radian: number): number {
    return this.R2D * radian
  }

  static covertToCssCoordinate(angle: number): number {
    angle += 90
    angle < 0 && (angle += 360)

    return angle
  }

  protected computeAngleToCenter(pos: Pos): number {
    const x = pos.x - this.rotationOriginPos.x
    const y = pos.y - this.rotationOriginPos.y
    let _angle = BaseRotation2d.convertRadianToDegree(Math.atan2(y, x))
    _angle = BaseRotation2d.covertToCssCoordinate(_angle)

    return _angle
  }

  protected getCssTransform() {
    const transform = this.el.style.transform
    const collection = new Map<string, string>()

    const matches = transform.matchAll(/(\S+)\(([^()]+)\)/g)
    for (const match of matches) {
      collection.set(match[1], match[2])
    }

    return collection
  }

  protected setCssTransform(collection: Map<string, string>) {
    const transform: string[] = []
    collection.forEach((vus, fn) => {
      transform.push(`${fn}(${vus})`)
    })
    this.el.style.transform = transform.join(' ')
    return this
  }

  protected setCssTransformFunction(functionName: string, value: string) {
    const collection = this.getCssTransform()
    collection.set(functionName, value)
    return this.setCssTransform(collection)
  }

  protected setCssTransformRotate(angle: number) {
    return this.setCssTransformFunction('rotate', `${angle}deg`)
  }

  protected setRoundedTransformRotate(angle: number) {
    return this.setCssTransformRotate(this.roundAngle(angle))
  }

  /// callbacks ///

  public addCallbacks(callbackCollection: CallbackCollection) {
    for (const action in callbackCollection) {
      const callbacks = callbackCollection[action as Action]
      if (!callbacks) continue

      const cbs = this.innerCallbackCollection[
        action as Action
      ] as Set<Callback>

      if (callbacks instanceof Function) {
        cbs.add(callbacks)
      } else {
        callbacks.forEach((cb) => cbs.add(cb))
      }
    }
    return this
  }

  protected invokeCallbacks(action: Action) {
    let cbs = this.innerCallbackCollection[action]

    cbs.forEach((cb) => cb(this.createCallbackParams()))
    return this
  }

  protected createCallbackParams(params?: CallbackParams): CallbackParams {
    return {
      el: this.el,
      rotationOriginPos: this.rotationOriginPos,
      angle: this.angle,
      rotating: this.rotating,
      ...params,
    }
  }
}
