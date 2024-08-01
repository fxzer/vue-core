// eslint-disable-next-line import/no-mutable-exports
export let activeEffect
export let lastEffect
export function effect(fn, options = {}) {
  // 创建 响应式 effect，数据变化时，重新执行 effect 函数
  const _effect = new ReactiveEffect(fn, () => { // 调度函数
    _effect.run()
  })
  _effect.run() // 首次执行
}

class ReactiveEffect {
  public active = true
  constructor(public fn, public scheduler) {
  }

  run() {
    if (!this.active) { // 是激活的则执行一次
      return this.fn()
    }
    lastEffect = activeEffect // 记录上一次的 effect
    try {
      // eslint-disable-next-line ts/no-this-alias
      activeEffect = this
      return this.fn()
    }
    finally {
      activeEffect = lastEffect // 恢复上一次的 effect
    }
  }
}
