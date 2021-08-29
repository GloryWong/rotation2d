import { JsonValue, Primitive } from 'type-fest'
export declare type Pos = {
  x: number
  y: number
}
export declare enum Action {
  READY_ROTATE = 'readyRotate',
  ROTATE = 'rotate',
  STOP_ROTATE = 'stopRotate',
}
export declare type CallbackParams = {
  el: El
  rotationOriginPos: Pos
  angle: number
  rotating: boolean
  [extra: string]: JsonValue | Primitive | HTMLElement
}
export declare type Callback = (callbackParams: CallbackParams) => void
export declare type Callbacks = Callback | Array<Callback> | Set<Callback>
export declare type CallbackCollection = Partial<Record<Action, Callbacks>>
declare type InnerCallbackCollection = Record<Action, Set<Callback>>
export declare type El = HTMLElement | string
declare type InitialAngle = number | (() => number)
export declare type BaseOptions = {
  initialAngle?: InitialAngle
  rotationOriginPos?: Pos
  callbackCollection?: CallbackCollection
  stepAngle?: number
}
export declare abstract class BaseRotation2d {
  static R2D: number
  protected el: HTMLElement
  protected angle: number
  protected rotationOriginPos: Pos
  protected stepAngle: number
  protected rotating: boolean
  protected options: BaseOptions
  protected innerCallbackCollection: InnerCallbackCollection
  constructor(el: El, options?: BaseOptions)
  protected parseInitialAngle(initialAngle: InitialAngle): number
  static observer(variable: Primitive): {
    value: Primitive
    callbacks: Readonly<Set<(oldValue: Primitive, newValue: Primitive) => void>>
    addCallbacks: (
      callbacks:
        | ((oldValue: Primitive, newValue: Primitive) => void)
        | ((oldValue: Primitive, newValue: Primitive) => void)[]
    ) => void
  }
  static parseElement(el: El): HTMLElement
  protected init(): this
  static getCenterPos(el: HTMLElement): Pos
  static modeAngle(angle: number): number
  protected roundAngle(angle: number): number
  static convertRadianToDegree(radian: number): number
  static covertToCssCoordinate(angle: number): number
  protected computeAngleToCenter(pos: Pos): number
  protected getCssTransform(): Map<string, string>
  protected setCssTransform(collection: Map<string, string>): this
  protected setCssTransformFunction(functionName: string, value: string): this
  protected setCssTransformRotate(angle: number): this
  protected setRoundedTransformRotate(angle: number): this
  addCallbacks(callbackCollection: CallbackCollection): this
  protected invokeCallbacks(action: Action): this
  protected createCallbackParams(params?: CallbackParams): CallbackParams
}
export {}
