import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

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
})
