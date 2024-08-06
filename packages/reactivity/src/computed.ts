import { isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export class ComputedRefImpl {
  public _value
  public effect
  constructor(getter, setter) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 计算属性依赖变了要执行的调度函数
        triggerRefValue(this) // 触发更新后需要把 dirty 置为 4
      },
    )
  }

  get value() {
    // 缓存机制
    if (this.effect.dirty) {
      this._value = this.effect.run()
      trackRefValue(this)
      console.log('[ this ]-23', this)

      // 当前effect中访问了computed,需要收集effect，当computed依赖变化时，需要重新执行effect
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {}
  }
  else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
