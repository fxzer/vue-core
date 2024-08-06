import { isArray, isFunction, isMap, isObject, isPlainObject, isSet } from '@vue/shared'
import { isRef } from './ref'
import { ReactiveEffect } from './effect'

export function watchEffect(effect) {
  const runner = effect
  runner()
}

export function watch(source, cb, options = {}) {
  return doWatch(source, cb, options)
}

function traverse(source, depth, currentDepth = 0, seen: Set<unknown> = new Set()) {
  if (!isObject(source))
    return source

  if (depth) {
    if (currentDepth >= depth)
      return source
    currentDepth++
  }
  // 防止循环引用
  if (seen.has(source)) {
    return source
  }
  seen.add(source)

  for (const key in source) {
    // 访问每个属性 get
    traverse(source[key], depth, currentDepth, seen)
  }
  return source
}

function doWatch(source, cb, {
  deep = true,
  immediate = false,
}) {
  const refactiveGetter = isFunction(source) ? source : source => traverse(source, deep === false ? 1 : undefined)

  const getter = () => refactiveGetter(source)
  let oldValue
  let effect
  const job = () => {
    if (!effect.active || !effect.dirty) {
      return
    }
    const newValue = effect.run()
    if (cb)
      cb(newValue, oldValue)
    oldValue = newValue
  }
  effect = new ReactiveEffect(getter, job)
  if (immediate) {
    job()
  }
  else {
    oldValue = effect.run()
  }
}
// 根据 是否 deep 判断是否需要递归遍历
