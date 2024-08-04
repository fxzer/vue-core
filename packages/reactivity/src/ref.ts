import { createDep } from './dep'
import { activeEffect, trackEffect, triggerEffect } from './effect'
import { isReactive, toReactive } from './reactive'

export function ref(value) {
  return createRef(value)
}
export function isRef(value) {
  return value && value._v_isRef === true
}

function createRef(value) {
  return new RefImpl(value)
}

class RefImpl {
  public _v_isRef = true
  public _value
  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = newValue
      this.rawValue = newValue
      triggerRefValue(this)
    }
  }
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      ref.dep = createDep(() => ref.dep = undefined, 'ref'),
    )
  }
}

function triggerRefValue(ref) {
  const dep = ref.dep
  if (dep)
    triggerEffect(dep)
}

class ObjectRefImpl {
  constructor(public _object, public _key, public _defaultVlaue?) {}

  get value() {
    const val = this._object[this._key]
    return val === undefined ? this._defaultVlaue : val
  }

  set value(newValue) {
    this._object[this._key] = newValue
  }
}
export function unref(ref) {
  return isRef(ref) ? ref.value : ref
}
export function toRef(object, key, defaultValue?) {
  return new ObjectRefImpl(object, key, defaultValue)
}

export function toRefs(object) {
  const ret = {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    }
    else {
      return Reflect.set(target, key, value, receiver)
    }
  },
}

/** 返回一个代理对象 */
export function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs)
    ? objectWithRefs
    : new Proxy(objectWithRefs, shallowUnwrapHandlers)
}

export function customRef(factory) {
  return new CustomRefImpl(factory)
}

class CustomRefImpl {
  public dep
  public _v_isRef = true

  public readonly _get
  public readonly _set
  constructor(public factory) {
    const { get, set } = factory(() => {
      if (this.dep)
        triggerEffect(this.dep)
    }, () => {
      if (this.dep)
        triggerEffect(this.dep)
    })
    this._get = get
    this._set = set
  }

  get value() {
    return this._get()
  }

  set value(newVal) {
    this._set(newVal)
  }
}
