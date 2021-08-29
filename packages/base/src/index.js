export var Action
;(function (Action) {
  Action['READY_ROTATE'] = 'readyRotate'
  Action['ROTATE'] = 'rotate'
  Action['STOP_ROTATE'] = 'stopRotate'
})(Action || (Action = {}))
export class BaseRotation2d {
  static R2D = 180 / Math.PI
  el
  angle = 0
  rotationOriginPos
  stepAngle = 1
  rotating = false
  options = {}
  innerCallbackCollection = {
    [Action.READY_ROTATE]: new Set(),
    [Action.ROTATE]: new Set(),
    [Action.STOP_ROTATE]: new Set(),
  }
  constructor(el, options = {}) {
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
  parseInitialAngle(initialAngle) {
    return typeof initialAngle === 'number'
      ? BaseRotation2d.modeAngle(initialAngle)
      : initialAngle()
  }
  static observer(variable) {
    return new Proxy(
      {
        value: variable,
        callbacks: new Set(),
        addCallbacks: function (callbacks) {
          if (Array.isArray(callbacks)) {
            callbacks.forEach((cb) => this.callbacks.add(cb))
          } else {
            this.callbacks.add(callbacks)
          }
        },
      },
      {
        set(obj, prop, value) {
          if (obj.value !== value) {
            obj.callbacks.forEach((cb) => cb(value, obj.value))
            obj.value = value
          }
          return true
        },
        get: (obj, prop) => {
          if (prop === 'value') return obj.value
          if (prop === 'callbacks') return obj.callbacks
          if (prop === 'addCallbacks') return obj.addCallbacks
        },
      }
    )
  }
  static parseElement(el) {
    let _el
    if (typeof el === 'string') {
      _el = document.querySelector(el)
      if (_el === null) {
        throw Error(`${el} is not a valid selector`)
      }
    } else {
      _el = el
    }
    return _el
  }
  init() {
    return this.setRoundedTransformRotate(this.angle)
  }
  static getCenterPos(el) {
    const { left, top, width, height } = el.getBoundingClientRect()
    return {
      x: left + width / 2,
      y: top + height / 2,
    }
  }
  static modeAngle(angle) {
    angle %= 360
    angle < 0 && (angle += 360)
    return angle
  }
  roundAngle(angle) {
    return Math.round(angle / this.stepAngle) * this.stepAngle
  }
  static convertRadianToDegree(radian) {
    return this.R2D * radian
  }
  static covertToCssCoordinate(angle) {
    angle += 90
    angle < 0 && (angle += 360)
    return angle
  }
  computeAngleToCenter(pos) {
    const x = pos.x - this.rotationOriginPos.x
    const y = pos.y - this.rotationOriginPos.y
    let _angle = BaseRotation2d.convertRadianToDegree(Math.atan2(y, x))
    _angle = BaseRotation2d.covertToCssCoordinate(_angle)
    return _angle
  }
  getCssTransform() {
    const transform = this.el.style.transform
    const collection = new Map()
    const matches = transform.matchAll(/(\S+)\(([^()]+)\)/g)
    for (const match of matches) {
      collection.set(match[1], match[2])
    }
    return collection
  }
  setCssTransform(collection) {
    const transform = []
    collection.forEach((vus, fn) => {
      transform.push(`${fn}(${vus})`)
    })
    this.el.style.transform = transform.join(' ')
    return this
  }
  setCssTransformFunction(functionName, value) {
    const collection = this.getCssTransform()
    collection.set(functionName, value)
    return this.setCssTransform(collection)
  }
  setCssTransformRotate(angle) {
    return this.setCssTransformFunction('rotate', `${angle}deg`)
  }
  setRoundedTransformRotate(angle) {
    return this.setCssTransformRotate(this.roundAngle(angle))
  }
  addCallbacks(callbackCollection) {
    for (const action in callbackCollection) {
      const callbacks = callbackCollection[action]
      if (!callbacks) continue
      const cbs = this.innerCallbackCollection[action]
      if (callbacks instanceof Function) {
        cbs.add(callbacks)
      } else {
        callbacks.forEach((cb) => cbs.add(cb))
      }
    }
    return this
  }
  invokeCallbacks(action) {
    let cbs = this.innerCallbackCollection[action]
    cbs.forEach((cb) => cb(this.createCallbackParams()))
    return this
  }
  createCallbackParams(params) {
    return {
      el: this.el,
      rotationOriginPos: this.rotationOriginPos,
      angle: this.angle,
      rotating: this.rotating,
      ...params,
    }
  }
}
