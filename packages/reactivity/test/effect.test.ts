import { describe, expect, it, vi } from 'vitest'
import { activeEffect, effect, lastEffect, reactive } from '../src'

describe('reactivity/effect', () => {
  it('effect 应该被定义且是函数', () => {
    expect(effect).toBeDefined()
    expect(effect).toBeTypeOf('function')
  })
  it('传给 effect 的函数应该被调用一次', () => {
    const fnSpy = vi.fn(() => {})
    effect(fnSpy)
    expect(fnSpy).toHaveBeenCalledTimes(1)
  })

  it('effect 执行完销毁（effect 外部再次改依赖时，不再执行副作用函数）', () => {
    const counter = reactive({ num: 0 })
    expect(activeEffect).toBeUndefined()
    effect(() => {
      counter.num++
      expect(activeEffect).toBeDefined()
    })
    expect(activeEffect).toBeUndefined()
  })

  it('嵌套 effect，执行完内部 effect 应该重新设置回外部 effect 实例', () => {
    /*
    let lastEffect =  activeEffect // 执行当前 effect 时，保存外部的 activeEffect
    activeEffect = this // 执行当前 effect 时，设置 activeEffect 为当前 effect
    activeEffect = lastEffect // 执行完当前 effect 时，设置回 activeEffect 为外部的 activeEffect

    effect(() =>{
     // 产生 e1
      console.log()
      effect(() =>{
        // e2
      })
    })
    // activeEffect 应该设置回 e1
   */
    expect(activeEffect).toBeUndefined()
    let e1
    effect(() => {
      e1 = activeEffect
      effect(() => {
        expect(activeEffect).toBeDefined()
      }) // 已恢复外层实例
      expect(e1).toEqual(activeEffect)
    })
    expect(activeEffect).toEqual(e1)
  })
})
