import { isArray, isFunction, isMap, isObject, isPlainObject, isSet } from '@vue/shared'
import { isReactive } from 'vue'
import { isRef } from './ref'
import { ReactiveEffect } from './effect'

export function watch(source, cb, options = {}) {
  return doWatch(source, cb, options)
}
export function watchEffect(source, options = {}) {
  return doWatch(source, null, options)
}

// 根据 是否 deep 判断是否需要递归遍历
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
  const refactiveGetter = source => traverse(source, deep === false ? 1 : undefined)

  let getter
  if (isFunction(source)) {
    getter = source
  }
  else if (isRef(source)) {
    getter = () => source.value
  }
  else if (isReactive(source)) {
    getter = () => refactiveGetter(source)
  }
  else {
    console.warn('[watch]: watch source should be a function, ref, or reactive object')
  }
  let oldValue
  let effect

  function job() {
    if (!effect.active || !effect.dirty) {
      return
    }
    if (cb) {
      const newValue = effect.run()
      cb(newValue, oldValue)
      oldValue = newValue
    }
    else {
      effect.run() // watchEffect
    }
  }

  if (!getter)
    return
  effect = new ReactiveEffect(getter, job)

  if (cb) {
    if (immediate) {
      job()
    }
    else {
      oldValue = effect.run()
    }
  }
  else { // watchEffect
    effect.run()
  }
}
