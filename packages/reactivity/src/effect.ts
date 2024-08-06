import { DirtyFlags } from './constants'

// eslint-disable-next-line import/no-mutable-exports
export let activeEffect

export class ReactiveEffect {
  public active = true
  public _trackId = 0 // 副作用执行的次数
  public deps = [] // 副作用上记忆依赖
  public _depLength = 0
  public _runnings = 0
  public _dirtyLevel = DirtyFlags.IS_DIRTY // 副作用执行时，依赖的响应式数据是否变化 0：未变化，4：变化
  constructor(public fn, public scheduler) {
  }

  public get dirty() {
    return this._dirtyLevel
  }

  public set dirty(dirty: 0 | 4) {
    this._dirtyLevel = dirty
  }

  run() {
    this._dirtyLevel = DirtyFlags.NO_DITY // 每次 effect 执行前，重置为未变化
    if (!this.active) { // 只执行一次， effectScope.stop() 停止收集依赖
      return this.fn()
    }
    const lastEffect = activeEffect // 记录上一次的 effect
    try {
      // eslint-disable-next-line ts/no-this-alias
      activeEffect = this

      // 每次 effect 执行前，清空上一次的依赖
      preCleanEffect(this)
      this._runnings++
      return this.fn()
    }
    finally {
      activeEffect = lastEffect // 恢复上一次的 effect
      this._runnings--
      postCleanEffect(this)
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      // 清理 effect 实例上记忆的依赖
      postCleanEffect(this)
      postCleanEffect(this)
    }
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
  runner.effect = _effect
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
      cleanDepEffect(effect.deps[i])
    }
    effect.deps.length = effect._depLength
  }
}
export function triggerEffect(dep) {
  for (const effect of dep.keys()) {
    // 触发更新需要更新 effect实例标志为脏数据，重新执行 effect 函数
    if (effect._dirtyLevel === DirtyFlags.NO_DITY) {
      effect._dirtyLevel = DirtyFlags.IS_DIRTY
    }
    if (effect._runnings === 0) { // 防止同一个 effect 触发更新造成栈溢出
      if (effect.scheduler) {
        effect.scheduler()
      }
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
