import { isObject } from '@vue/shared'

enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
export function isReactive(target) {
  return target[ReactiveFlags.IS_REACTIVE]
}
export function reactive(target) {
  if (!isObject(target))
    return target

  // 判断是否已经代理过，则命中缓存
  if(isReactive(target))
    return target

  return new Proxy(target, {
    get(target, key) {
      if(key === ReactiveFlags.IS_REACTIVE)
        return true
      return Reflect.get(target, key)
    },
    set(target, key, value, receiver) {
      Reflect.set(target, key, value)
      return true
    },
  })
}
