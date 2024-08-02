import { createDep } from './dep'
import { activeEffect, trackEffect, triggerEffect } from './effect'
import { toReactive } from './reactive'

export function ref(value) {
  return createRef(value)
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
