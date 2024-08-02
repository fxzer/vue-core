// eslint-disable-next-line import/no-mutable-exports
export let activeEffect

export class ReactiveEffect {
  public active = true
  public _trackId = 0 // 副作用执行的次数
  public deps = [] // 副作用上记忆依赖
  public _depLength = 0
  constructor(public fn, public scheduler) {
  }

  run() {
    if (!this.active) { // 只执行一次， effectScope.stop() 停止收集依赖
      return this.fn()
    }
    const lastEffect = activeEffect // 记录上一次的 effect
    try {
      // eslint-disable-next-line ts/no-this-alias
      activeEffect = this

      // 每次 effect 执行前，清空上一次的依赖
      preCleanEffect(this)
      return this.fn()
    }
    finally {
      activeEffect = lastEffect // 恢复上一次的 effect
      postCleanEffect(this)
    }
  }

  stop() {
    this.active = false // 停止收集依赖
  }
}

export function effect(fn, options = {}) {
  // 创建 响应式 effect，数据变化时，重新执行 effect 函数
  const _effect = new ReactiveEffect(fn, () => { // 调度函数
    _effect.run()
  })
  if (options) {
    Object.assign(_effect, options)
  }
  _effect.run() // 首次执行
  const runner = _effect.run.bind(_effect)
  return runner // 外部可以调用 runner() 控制更新
}

function cleanDepEffect(dep) {
  dep.delete()
  if (dep.size === 0) { // depsMap 为空，则清理 targetMap
    dep.cleanup()
  }
}

function preCleanEffect(effect) {
  effect._depLength = 0
  effect._trackId++
}
function postCleanEffect(effect) {
  if (effect.deps.length > effect._depLength) {
    for (let i = effect._depLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect)
    }
    effect.deps.length = effect._depLength
  }
}
export function triggerEffect(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler()
    }
  }
}
export function trackEffect(effect, dep) {
  // 优化同个 effect 函数对应多次依赖收集，只收集一次
  // undefined   1    ->    1    1
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)
    // 解决条件分支问题，对比算法
    const oldDep = effect.deps[effect._depLength]
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep)
      }
    }
  }
}
