import { isObject } from '@vue/shared'
import { ReactiveFlags } from './constants'
import { mutableHandlers } from './baseHandler'

export function isReactive(value) {
  return value[ReactiveFlags.IS_REACTIVE]
}
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
export function reactive(target) {
  return createReactiveObject(target)
}

export function createReactiveObject(target) {
  if (!isObject(target))
    return target

  // 判断是否已经代理过，则命中缓存
  if (isReactive(target))
    return target

  return new Proxy(target, mutableHandlers)
}
