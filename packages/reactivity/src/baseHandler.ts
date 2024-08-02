import { track, trigger } from './reactiveEffect'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export const mutableHandlers = {
  // receiver 是 Proxy 对象
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return true
    track(target, key)
    return Reflect.get(target, key)
  },
  set(target, key, value, receiver) {
    // 避免代理对象中访问代理对象属性（ receiver[key] = value ） 触发 set，导致死循环
    const oldValue = target[key]
    const result = Reflect.set(target, key, value)

    // 修改前后值不相等，则触发依赖更新页面
    if (result && oldValue !== value) {
      trigger(target, key, value, oldValue)
    }
    return result
  },
}
