import { Merge } from 'type-fest'
import {
  BaseRotation2d,
  Pos,
  CallbackParams,
  El,
  BaseOptions,
} from '@gloxy/rotation2d-base'
export declare type InteractionEvent = MouseEvent | TouchEvent
export declare type DragCallbackParams = Merge<
  CallbackParams,
  {
    startAngle: number
    flyingAngle: number
  }
>
export declare type InteractionEl = HTMLElement | string
export declare type DragOptions = Merge<
  BaseOptions,
  {
    interactionEl?: HTMLElement
    circular?: boolean
  }
>
export declare class DragRotation2d extends BaseRotation2d {
  protected interactionEl: HTMLElement
  protected circular: boolean
  protected startAngle: number
  protected flyingAngle: number
  protected rotating: boolean
  protected rotatingProxy: any
  protected options: DragOptions
  constructor(el: El, options?: DragOptions)
  static getEventPos(event: InteractionEvent): Pos
  protected computeFlyingAngle(angleChange: number): number
  protected createCallbackParams(params?: CallbackParams): CallbackParams
  readyRotate(pos: Pos): this
  rotate(pos: Pos): this
  stopRotate(): this
  protected handleStart(event: InteractionEvent): this
  protected handleMove(event: InteractionEvent): this
  protected handleStop(event: InteractionEvent): this
  protected registerEventHandlers(): this
}
