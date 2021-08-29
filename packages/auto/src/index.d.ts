import { Merge, ValueOf, SetOptional } from 'type-fest'
import { BaseRotation2d, BaseOptions, El } from '@gloxy/rotation2d-base'
export declare type AutoOptions = Merge<BaseOptions, {}>
export declare type Transition = SetOptional<{
  targetAngle: number
  speed: number
}>
export declare class AutoRotation2d extends BaseRotation2d {
  private timer
  private transition
  constructor(el: El, options?: AutoOptions)
  protected initTimer(): this
  setTransition(transition: Transition): this
  startTransition(): this
  pauseTransition(): this
  resumeTransition(): this
  transitFromTo(
    fromAngle: number,
    toAngle: ValueOf<Transition, 'targetAngle'>
  ): void
  transitTo(
    angle: ValueOf<Transition, 'targetAngle'>,
    {
      speed,
    }?: {
      speed?: ValueOf<Transition, 'speed'>
    }
  ): this
}
