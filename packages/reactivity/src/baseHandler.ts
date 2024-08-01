export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export const mutableHandlers = {
  get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return true
    return Reflect.get(target, key)
  },
  set(target, key, value, receiver) {
    console.log('[ receiver ]-20', receiver)
    Reflect.set(target, key, value)
    return true
  },
}
