import { isObject } from '@vue/shared'
import { track, trigger } from './reactiveEffect'
import { reactive } from './reactive'
import { ReactiveFlags } from './constants'

export const mutableHandlers = {
  // receiver 是 Proxy 对象
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return true
    track(target, key)
    const result = Reflect.get(target, key, receiver)
    if (isObject(result)) {
      return reactive(result) // 懒代理，若访问的值是对象，继续代理
    }
    return result
  },
  set(target, key, value, receiver) {
    // 避免代理对象中访问代理对象属性（ receiver[key] = value ） 触发 set，导致死循环
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)

    // 修改前后值不相等，则触发依赖更新页面
    if (result && oldValue !== value) {
      trigger(target, key)
    }
    return result
  },
}
