import { isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'
/**
 * 计算属性原理：
 * 1. 计算属性实例中有一个effect实例，具备响应式的能力
 * 2. 访问计算属性时，执行 effect.run()， 并把 dirty 设为 false
 * 3. 计算属性依赖的响应式数据变化时，触发 effect.scheduler()，把 dirty 设为 true，
 *    重新执行 effect调度函数 并执行 run()，触发计算属性收集的 effect，重新渲染
 */
export class ComputedRefImpl {
  public _value
  public effect
  constructor(public getter, public setter) {
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
